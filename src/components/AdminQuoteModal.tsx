import { Button, DatePicker, InputNumber, Modal, Segmented, Select, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { ProjectListItem, QuoteListItem } from "../data/portal";
import {
  createQuote,
  getCatalogItems,
  updateQuote,
  type CatalogItem,
  type QuotePaymentScheduleInput,
} from "../services/portalApi";
import { PORTAL_DATE_FORMAT } from "../utils/dateFormat";
import { showRequestToast } from "../utils/portalToast";
import { PortalIcon } from "./PortalIcon";

type AdminQuoteModalProps = {
  mode?: "create" | "edit";
  onClose: () => void;
  onCreated?: (quote: QuoteListItem) => void;
  onSaved?: (quote: QuoteListItem) => void;
  open: boolean;
  project: ProjectListItem | null;
  quote?: QuoteListItem | null;
};

type QuoteLineDraft = {
  catalogItemId: string;
  isCustom: boolean;
  key: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type QuoteFormState = {
  dateIssued: string;
  discount: number;
  name: string;
  shippingFee: number;
  tax: number;
  validUntil: string;
};

type ScheduleAmountType = "fixed" | "percentage";

type ScheduleRowDraft = {
  amount: number;
  amountType: ScheduleAmountType;
  date: string;
  key: string;
  name: string;
};

type ScheduleDisplayRow = {
  amount: number;
  amountPercent: number;
  date: string;
  key: string;
  name: string;
  removable?: boolean;
  readOnlyAmount?: boolean;
  readOnlyDate?: boolean;
};

function dateValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 10);
}

function dateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function emptyLine(isCustom = false): QuoteLineDraft {
  return {
    catalogItemId: "",
    isCustom,
    key: crypto.randomUUID(),
    productName: "",
    quantity: 1,
    unitPrice: 0,
  };
}

function numberFromPrice(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    return Number(value.replace(/[^0-9.-]/g, "")) || 0;
  }

  return 0;
}

function emptyScheduleRow(name: string): ScheduleRowDraft {
  return {
    amount: 0,
    amountType: "fixed",
    date: "",
    key: crypto.randomUUID(),
    name,
  };
}

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function percentFromAmount(amount: number, sourceAmount: number) {
  return sourceAmount > 0 ? (amount / sourceAmount) * 100 : 0;
}

function amountFromPercent(percent: number, sourceAmount: number) {
  return (Math.max(0, percent) / 100) * Math.max(0, sourceAmount);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function scheduleDateValue(value: string) {
  if (!value) {
    return null;
  }

  const oldPortalDate = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  const portalDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (oldPortalDate) {
    return dayjs(`${oldPortalDate[1]}-${oldPortalDate[3]}-${oldPortalDate[2]}`);
  }

  if (portalDate) {
    return dayjs(`${portalDate[3]}-${portalDate[1]}-${portalDate[2]}`);
  }

  return dayjs(value);
}

function scheduleDateText(value?: string | null) {
  if (!value || value === "Date of Invoice Generation") {
    return value || "";
  }

  const date = scheduleDateValue(value);

  return date?.isValid() ? date.format(PORTAL_DATE_FORMAT) : value;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(value);
}

function itemSearchText(item: CatalogItem) {
  return [
    item.productName,
    item.category,
    item.subcategory,
    item.itemCode,
    item.supplier,
  ]
    .filter(Boolean)
    .join(" ");
}

function lineFromQuoteItem(
  item: NonNullable<QuoteListItem["lineItems"]>[number],
  catalogItems: CatalogItem[],
): QuoteLineDraft {
  const matchedCatalogItem = catalogItems.find(
    (catalogItem) =>
      catalogItem.id === item.serviceId ||
      catalogItem.productName.trim().toLowerCase() === item.description.trim().toLowerCase(),
  );

  return {
    catalogItemId: matchedCatalogItem?.id || "",
    isCustom: !matchedCatalogItem,
    key: crypto.randomUUID(),
    productName: item.description,
    quantity: item.qty || 1,
    unitPrice: numberFromPrice(item.rate),
  };
}

function AdminQuoteModal({
  mode = "create",
  onClose,
  onCreated,
  onSaved,
  open,
  project,
  quote,
}: AdminQuoteModalProps) {
  const isEdit = mode === "edit" && quote;
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState<QuoteFormState>({
    dateIssued: dateValue(),
    discount: 0,
    name: "",
    shippingFee: 0,
    tax: 0,
    validUntil: dateValue(14),
  });
  const [isPaymentScheduleOpen, setIsPaymentScheduleOpen] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isDepositRequested, setIsDepositRequested] = useState(false);
  const [isBalanceSplit, setIsBalanceSplit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lines, setLines] = useState<QuoteLineDraft[]>([emptyLine()]);
  const [balanceRow, setBalanceRow] = useState<ScheduleRowDraft>(() => emptyScheduleRow("Balance"));
  const [depositRow, setDepositRow] = useState<ScheduleRowDraft>(() => emptyScheduleRow("Deposit"));
  const [fullPaymentRow, setFullPaymentRow] = useState<ScheduleRowDraft>(() => emptyScheduleRow("Amount"));
  const [splitRows, setSplitRows] = useState<ScheduleRowDraft[]>(() => [
    emptyScheduleRow("Payment 1"),
    emptyScheduleRow("Payment 2"),
  ]);
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  useEffect(() => {
    if (!open || catalogItems.length) {
      return;
    }

    let isMounted = true;
    setIsCatalogLoading(true);
    getCatalogItems()
      .then((items) => {
        if (isMounted) {
          setCatalogItems(items.filter((item) => item.active !== false));
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          showRequestToast("load-catalog", "Loading products and services...").error(
            error.message || "Unable to load products and services.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [catalogItems.length, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEdit) {
      setForm({
        dateIssued: dateInputValue(quote.dateIssued) || dateValue(),
        discount: 0,
        name: quote.title,
        shippingFee: 0,
        tax: numberFromPrice(quote.tax),
        validUntil: dateInputValue(quote.validUntil) || dateValue(14),
      });
      setLines(
        quote.lineItems?.length
          ? quote.lineItems.map((item) => lineFromQuoteItem(item, catalogItems))
          : [emptyLine()],
      );
      setSubcategoryFilter("");
      setIsPaymentScheduleOpen(Boolean(quote.paymentSchedule));
      setIsDepositRequested(quote.paymentSchedule?.type === "DEPOSIT_AND_BALANCE" || quote.paymentSchedule?.type === "DEPOSIT_AND_SPLIT_BALANCE");
      setIsBalanceSplit(quote.paymentSchedule?.type === "DEPOSIT_AND_SPLIT_BALANCE");
      setDepositRow({
        amount: quote.paymentSchedule?.deposit?.amountType === "percentage"
          ? quote.paymentSchedule.deposit.percentage
          : quote.paymentSchedule?.deposit?.amount ?? 0,
        amountType: quote.paymentSchedule?.deposit?.amountType ?? "fixed",
        date: "",
        key: crypto.randomUUID(),
        name: "Deposit",
      });
      setBalanceRow({
        amount: quote.paymentSchedule?.balance?.amount ?? 0,
        amountType: "fixed",
        date: scheduleDateText(quote.paymentSchedule?.balance?.date),
        key: crypto.randomUUID(),
        name: "Balance",
      });
      setFullPaymentRow({
        amount: quote.paymentSchedule?.fullPayment?.amount ?? 0,
        amountType: "fixed",
        date: scheduleDateText(quote.paymentSchedule?.fullPayment?.date),
        key: crypto.randomUUID(),
        name: "Amount",
      });
      setSplitRows(
        quote.paymentSchedule?.balance?.payments?.length
          ? quote.paymentSchedule.balance.payments.map((payment, index) => ({
              amount: payment.amount,
              amountType: "fixed",
              date: scheduleDateText(payment.date),
              key: crypto.randomUUID(),
              name: payment.name || `Payment ${index + 1}`,
            }))
          : [emptyScheduleRow("Payment 1"), emptyScheduleRow("Payment 2")],
      );
      return;
    }

    if (project) {
      setForm({
        dateIssued: dateValue(),
        discount: 0,
        name: `${project.title} Quote`,
        shippingFee: 0,
        tax: 0,
        validUntil: dateValue(14),
      });
      setLines([emptyLine()]);
      setSubcategoryFilter("");
      setIsPaymentScheduleOpen(false);
      setIsDepositRequested(false);
      setIsBalanceSplit(false);
      setDepositRow(emptyScheduleRow("Deposit"));
      setBalanceRow(emptyScheduleRow("Balance"));
      setFullPaymentRow(emptyScheduleRow("Amount"));
      setSplitRows([emptyScheduleRow("Payment 1"), emptyScheduleRow("Payment 2")]);
    }
  }, [catalogItems, isEdit, open, project, quote]);

  const subcategoryOptions = useMemo(() => {
    const subcategories = Array.from(
      new Set(catalogItems.map((item) => item.subcategory).filter(Boolean)),
    ).sort((first, second) => String(first).localeCompare(String(second)));

    return [
      { label: "All subcategories", value: "" },
      ...subcategories.map((subcategory) => ({
        label: String(subcategory),
        value: String(subcategory),
      })),
    ];
  }, [catalogItems]);

  const catalogOptions = useMemo(() => {
    const filteredItems = subcategoryFilter
      ? catalogItems.filter((item) => item.subcategory === subcategoryFilter)
      : catalogItems;

    return filteredItems.map((item) => ({
      label: `${item.productName}${item.category ? ` - ${item.category}` : ""}${
        item.subcategory ? ` - ${item.subcategory}` : ""
      }`,
      searchText: itemSearchText(item),
      value: item.id,
    }));
  }, [catalogItems, subcategoryFilter]);

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.unitPrice * Math.max(0, Number(line.quantity) || 0),
        0,
      ),
    [lines],
  );
  const discount = Math.max(0, Number(form.discount) || 0);
  const shippingFee = Math.max(0, Number(form.shippingFee) || 0);
  const taxAmount = (Math.max(0, Number(form.tax) || 0) / 100) * subtotal;
  const total = Math.max(0, subtotal + taxAmount - discount + shippingFee);
  const depositAmount =
    depositRow.amountType === "percentage"
      ? amountFromPercent(depositRow.amount, total)
      : depositRow.amount;
  const normalizedDepositAmount = roundMoney(clampAmount(depositAmount, total));
  const depositPercentage =
    depositRow.amountType === "percentage"
      ? clampAmount(depositRow.amount, 100)
      : percentFromAmount(normalizedDepositAmount, total);
  const balanceAmount = roundMoney(Math.max(0, total - normalizedDepositAmount));
  const balancePercentage = percentFromAmount(balanceAmount, total);
  const splitSourceAmount = isDepositRequested ? balanceAmount : total;

  function normalizeSplitRows(rows: ScheduleRowDraft[], sourceAmount: number, editedKey?: string) {
    if (!rows.length) {
      return rows;
    }

    if (rows.length === 1) {
      return [{ ...rows[0], amount: roundMoney(sourceAmount) }];
    }

    const absorberIndex =
      rows[rows.length - 1].key === editedKey ? rows.length - 2 : rows.length - 1;
    const nonAbsorberTotal = rows.reduce((sum, row, index) => (
      index === absorberIndex ? sum : sum + clampAmount(row.amount, sourceAmount)
    ), 0);
    const absorberAmount = roundMoney(Math.max(0, sourceAmount - nonAbsorberTotal));

    return rows.map((row, index) => ({
      ...row,
      amount: index === absorberIndex ? absorberAmount : roundMoney(clampAmount(row.amount, sourceAmount)),
    }));
  }

  const normalizedSplitRows = normalizeSplitRows(splitRows, splitSourceAmount);

  function updateForm<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateLine(key: string, patch: Partial<QuoteLineDraft>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function selectCatalogItem(key: string, itemId: string) {
    const item = catalogItems.find((catalogItem) => catalogItem.id === itemId);

    updateLine(key, {
      catalogItemId: itemId,
      isCustom: false,
      productName: item?.productName ?? "",
      unitPrice: numberFromPrice(item?.ourPrice),
    });
  }

  function addLineItem() {
    setLines((current) => [...current, emptyLine()]);
  }

  function addCustomLineItem() {
    setLines((current) => [...current, emptyLine(true)]);
  }

  function removeLineItem(key: string) {
    setLines((current) =>
      current.length > 1 ? current.filter((line) => line.key !== key) : current,
    );
  }

  function updateDepositAmount(value: number | null) {
    const inputValue = Number(value) || 0;
    const amount = depositRow.amountType === "percentage"
      ? clampAmount(inputValue, 100)
      : clampAmount(inputValue, total);

    setDepositRow((current) => ({ ...current, amount: roundMoney(amount) }));
  }

  function updateSplitAmountType(key: string, amountType: ScheduleAmountType) {
    setSplitRows((current) =>
      current.map((row) => (row.key === key ? { ...row, amountType } : row)),
    );
  }

  function updateSplitAmount(key: string, value: number | null) {
    const row = normalizedSplitRows.find((item) => item.key === key);
    const rawValue = Number(value) || 0;
    const nextAmount = row?.amountType === "percentage"
      ? amountFromPercent(rawValue, splitSourceAmount)
      : rawValue;

    setSplitRows((current) => {
      const targetIndex = current.findIndex((item) => item.key === key);
      const absorberIndex =
        targetIndex === current.length - 1 ? Math.max(0, current.length - 2) : current.length - 1;
      const reservedAmount = current.reduce((sum, item, index) => (
        index === targetIndex || index === absorberIndex ? sum : sum + item.amount
      ), 0);
      const maxAmount = Math.max(0, splitSourceAmount - reservedAmount);
      const patchedRows = current.map((item) =>
        item.key === key ? { ...item, amount: roundMoney(clampAmount(nextAmount, maxAmount)) } : item,
      );

      return normalizeSplitRows(patchedRows, splitSourceAmount, key);
    });
  }

  function updateSplitDate(key: string, date: string) {
    setSplitRows((current) =>
      current.map((row) => (row.key === key ? { ...row, date } : row)),
    );
  }

  function addSplitRow() {
    setSplitRows((current) => {
      const nextRows = [...current, emptyScheduleRow(`Payment ${current.length + 1}`)];
      const amount = roundMoney(splitSourceAmount / nextRows.length);

      return nextRows.map((row, index) => ({
        ...row,
        amount: index === nextRows.length - 1
          ? roundMoney(splitSourceAmount - amount * (nextRows.length - 1))
          : amount,
      }));
    });
  }

  function removeSplitRow(key: string) {
    setSplitRows((current) => {
      if (current.length <= 1) {
        return current;
      }

      const nextRows = current.filter((row) => row.key !== key);

      return normalizeSplitRows(nextRows, splitSourceAmount);
    });
  }

  function toggleDepositRequest(checked: boolean) {
    setIsDepositRequested(checked);

    if (!checked) {
      setIsBalanceSplit(false);
    }
  }

  function scheduleDateFromPicker(date: dayjs.Dayjs | null) {
    return date ? date.format(PORTAL_DATE_FORMAT) : "";
  }

  function fallbackScheduleDate(value: string, fallbackDate: string) {
    return value || scheduleDateText(fallbackDate);
  }

  function buildPaymentSchedule(): QuotePaymentScheduleInput {
    const scheduleTotal = roundMoney(total);

    if (!isDepositRequested) {
      return {
        fullPayment: {
          amount: scheduleTotal,
          date: fallbackScheduleDate(fullPaymentRow.date, form.validUntil),
          name: "Full Payment",
          percentage: 100,
        },
        totalAmount: scheduleTotal,
        type: "FULL_PAYMENT",
      };
    }

    const deposit = {
      amount: normalizedDepositAmount,
      amountType: depositRow.amountType,
      date: "Date of Invoice Generation",
      name: "Deposit",
      percentage: roundPercent(depositPercentage),
    };

    if (isBalanceSplit) {
      return {
        balance: {
          amount: balanceAmount,
          payments: normalizedSplitRows.map((row) => ({
            amount: roundMoney(row.amount),
            date: fallbackScheduleDate(row.date, form.validUntil),
            name: row.name,
            percentage: roundPercent(percentFromAmount(roundMoney(row.amount), splitSourceAmount)),
          })),
          percentage: roundPercent(balancePercentage),
          split: true,
        },
        deposit,
        totalAmount: scheduleTotal,
        type: "DEPOSIT_AND_SPLIT_BALANCE",
      };
    }

    return {
      balance: {
        amount: balanceAmount,
        date: fallbackScheduleDate(balanceRow.date, form.validUntil),
        name: "Balance",
        percentage: roundPercent(balancePercentage),
        split: false,
      },
      deposit,
      totalAmount: scheduleTotal,
      type: "DEPOSIT_AND_BALANCE",
    };
  }

  const fullPaymentRows: ScheduleDisplayRow[] = [
    {
      amount: roundMoney(total),
      amountPercent: 100,
      date: fullPaymentRow.date,
      key: "full-payment",
      name: "Full Payment",
      readOnlyAmount: true,
    },
  ];
  const depositRows: ScheduleDisplayRow[] = [
    {
      amount: normalizedDepositAmount,
      amountPercent: depositPercentage,
      date: "Date of Invoice Generation",
      key: "deposit",
      name: "Deposit",
      readOnlyDate: true,
    },
    ...(!isBalanceSplit
      ? [
          {
            amount: balanceAmount,
            amountPercent: balancePercentage,
            date: balanceRow.date,
            key: "balance",
            name: "Balance",
            readOnlyAmount: true,
          },
        ]
      : []),
  ];
  const splitDisplayRows: ScheduleDisplayRow[] = normalizedSplitRows.map((row) => ({
    amount: roundMoney(row.amount),
    amountPercent: percentFromAmount(row.amount, splitSourceAmount),
    date: row.date,
    key: row.key,
    name: row.name,
    removable: true,
  }));
  const fullPaymentColumns: ColumnsType<ScheduleDisplayRow> = [
    {
      dataIndex: "name",
      title: "Name",
      width: 180,
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      dataIndex: "amount",
      title: "Amount",
      render: (value: number) => <strong>{money(value)}</strong>,
    },
    {
      dataIndex: "date",
      title: "Date",
      render: (_value, row) => (
        <DatePicker
          format={PORTAL_DATE_FORMAT}
          onChange={(date) =>
            setFullPaymentRow((current) => ({
              ...current,
              date: scheduleDateFromPicker(date),
            }))
          }
          value={scheduleDateValue(row.date)}
        />
      ),
    },
  ];
  const depositColumns: ColumnsType<ScheduleDisplayRow> = [
    {
      dataIndex: "name",
      title: "Name",
      width: 180,
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      dataIndex: "amount",
      title: "Amount",
      render: (_value, row) =>
        row.key === "deposit" ? (
          <div className="quote-schedule-editable-amount">
            <Segmented
              onChange={(value) =>
                setDepositRow((current) => ({
                  ...current,
                  amount: value === "percentage" ? row.amountPercent : row.amount,
                  amountType: value as ScheduleAmountType,
                }))
              }
              options={[
                { label: "%", value: "percentage" },
                { label: "$", value: "fixed" },
              ]}
              size="small"
              value={depositRow.amountType}
            />
            <InputNumber
              min={0}
              onChange={updateDepositAmount}
              precision={2}
              value={depositRow.amountType === "percentage" ? roundMoney(row.amountPercent) : row.amount}
            />
            <small>
              {depositRow.amountType === "percentage"
                ? money(row.amount)
                : `${roundMoney(row.amountPercent)}%`}
            </small>
          </div>
        ) : (
          <strong>{money(row.amount)} ({roundMoney(row.amountPercent)}%)</strong>
        ),
    },
    {
      dataIndex: "date",
      title: "Date",
      render: (_value, row) =>
        row.readOnlyDate ? (
          <span className="quote-schedule-readonly-date">Date of Invoice Generation</span>
        ) : (
          <DatePicker
            format={PORTAL_DATE_FORMAT}
            onChange={(date) =>
              setBalanceRow((current) => ({
                ...current,
                date: scheduleDateFromPicker(date),
              }))
            }
            value={scheduleDateValue(row.date)}
          />
        ),
    },
  ];
  const splitColumns: ColumnsType<ScheduleDisplayRow> = [
    {
      dataIndex: "name",
      title: "Name",
      width: 180,
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      dataIndex: "amount",
      title: "Amount",
      render: (_value, row) => {
        const draft = normalizedSplitRows.find((item) => item.key === row.key);
        const amountType = draft?.amountType ?? "fixed";

        return (
          <div className="quote-schedule-editable-amount">
            <Segmented
              onChange={(value) => updateSplitAmountType(row.key, value as ScheduleAmountType)}
              options={[
                { label: "%", value: "percentage" },
                { label: "$", value: "fixed" },
              ]}
              size="small"
              value={amountType}
            />
            <InputNumber
              min={0}
              onChange={(value) => updateSplitAmount(row.key, value)}
              precision={2}
              value={amountType === "percentage" ? roundMoney(row.amountPercent) : row.amount}
            />
            <small>
              {amountType === "percentage"
                ? money(row.amount)
                : `${roundMoney(row.amountPercent)}%`}
            </small>
          </div>
        );
      },
    },
    {
      dataIndex: "date",
      title: "Date",
      render: (_value, row) => (
        <DatePicker
          format={PORTAL_DATE_FORMAT}
          onChange={(date) => updateSplitDate(row.key, scheduleDateFromPicker(date))}
          value={scheduleDateValue(row.date)}
        />
      ),
    },
    {
      dataIndex: "key",
      title: "Action",
      width: 84,
      render: (_value, row) => (
        <Button
          aria-label={`Remove ${row.name}`}
          disabled={normalizedSplitRows.length <= 1}
          icon={<PortalIcon name="delete" />}
          onClick={() => removeSplitRow(row.key)}
          type="text"
        />
      ),
    },
  ];

  async function handleSubmit() {
    if (!project && !quote?.projectId) {
      return;
    }

    const selectedLines = lines.filter((line) =>
      line.catalogItemId || (line.isCustom && line.productName.trim()),
    );

    if (!form.name.trim() || !form.dateIssued || !form.validUntil) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Quote name, issue date, and valid until date are required.",
      );
      return;
    }

    if (!selectedLines.length) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Add at least one product or service line item.",
      );
      return;
    }

    if (selectedLines.some((line) => !line.quantity || line.quantity <= 0)) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Each selected line item needs a quantity greater than zero.",
      );
      return;
    }

    if (selectedLines.some((line) => line.isCustom && (!line.productName.trim() || line.unitPrice <= 0))) {
      showRequestToast("quote-validation", "Checking quote...").error(
        "Manual line items need a product name and unit price greater than zero.",
      );
      return;
    }

    const payload = {
      dateIssued: form.dateIssued,
      lineItems: selectedLines.map((line) => {
        const quantity = Math.max(1, Number(line.quantity) || 1);

        if (line.isCustom) {
          const productName = line.productName.trim();
          const unitPrice = Math.max(0, Number(line.unitPrice) || 0);

          return {
            lineTotal: roundMoney(unitPrice * quantity),
            name: productName,
            price: unitPrice,
            productName,
            quantity,
            unitPrice,
          };
        }

        return {
          quantity,
          serviceId: line.catalogItemId,
        };
      }),
      name: form.name.trim(),
      paymentSchedule: buildPaymentSchedule(),
      subtotal,
      tax: Math.max(0, Number(form.tax) || 0),
      taxAmount,
      total,
      validUntil: form.validUntil,
    };
    const toast = showRequestToast(isEdit ? "update-quote" : "create-quote", isEdit ? "Updating quote..." : "Creating quote...");
    setIsSubmitting(true);

    try {
      const savedQuote = isEdit
        ? await updateQuote(quote.id, payload)
        : await createQuote({
            ...payload,
            projectId: project?.id || quote?.projectId || "",
          });

      toast.success(isEdit ? "Quote was updated." : `Quote created for ${project?.title || "project"}.`);
      onSaved?.(savedQuote);
      onCreated?.(savedQuote);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save quote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      okButtonProps={{ loading: isSubmitting }}
      okText={isEdit ? "Save quote" : "Create quote"}
      onCancel={onClose}
      onOk={handleSubmit}
      open={open}
      title={`${isEdit ? "Edit" : "Create"} quote${project ? ` for ${project.title}` : ""}`}
      width={1040}
    >
      <div className="admin-modal-form quote-create-form">
        <div className="quote-project-summary">
          <div>
            <span>Project</span>
            <strong>{project?.title || quote?.projectName || quote?.description || "Not selected"}</strong>
          </div>
          <div>
            <span>Client</span>
            <strong>{project?.clientName || "Not set"}</strong>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quoteName">Quote name</label>
            <input
              id="quoteName"
              onChange={(event) => updateForm("name", event.target.value)}
              value={form.name}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quoteDateIssued">Date issued</label>
            <DatePicker
              format={PORTAL_DATE_FORMAT}
              id="quoteDateIssued"
              onChange={(date) => updateForm("dateIssued", scheduleDateFromPicker(date))}
              value={scheduleDateValue(form.dateIssued)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quoteValidUntil">Valid until</label>
            <DatePicker
              format={PORTAL_DATE_FORMAT}
              id="quoteValidUntil"
              onChange={(date) => updateForm("validUntil", scheduleDateFromPicker(date))}
              value={scheduleDateValue(form.validUntil)}
            />
          </div>
        </div>

        <div className="quote-line-section">
          <div className="quote-line-section__header">
            <h3>Line items</h3>
            <div className="quote-line-section__tools">
              <Select
                onChange={setSubcategoryFilter}
                options={subcategoryOptions}
                value={subcategoryFilter}
              />
              <Button icon={<PortalIcon name="plus" />} onClick={addLineItem} type="default">
                Add catalog item
              </Button>
              <Button icon={<PortalIcon name="plus" />} onClick={addCustomLineItem} type="default">
                Add manual item
              </Button>
            </div>
          </div>

          <div className="quote-line-table">
            <div className="quote-line-table__head">
              <span>Product or service</span>
              <span>Unit price</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Action</span>
            </div>
            {lines.map((line) => (
              <div className="quote-line-table__row" key={line.key}>
                {line.isCustom ? (
                  <input
                    aria-label="Manual product or service name"
                    onChange={(event) =>
                      updateLine(line.key, { productName: event.target.value })
                    }
                    placeholder="Write product or service name"
                    value={line.productName}
                  />
                ) : (
                  <Select
                    filterOption={(input, option) =>
                      String(option?.searchText || option?.label || "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    loading={isCatalogLoading}
                    onChange={(value) => selectCatalogItem(line.key, value)}
                    options={catalogOptions}
                    placeholder="Search product, category, or subcategory"
                    showSearch
                    value={line.catalogItemId || undefined}
                  />
                )}
                <input
                  aria-label="Unit price"
                  onChange={(event) =>
                    updateLine(line.key, { unitPrice: numberFromPrice(event.target.value) })
                  }
                  type="number"
                  value={line.unitPrice}
                />
                <input
                  aria-label="Quantity"
                  min="1"
                  onChange={(event) =>
                    updateLine(line.key, { quantity: Number(event.target.value) || 0 })
                  }
                  type="number"
                  value={line.quantity}
                />
                <strong>{money(line.unitPrice * Math.max(0, Number(line.quantity) || 0))}</strong>
                <Button
                  aria-label="Remove line item"
                  disabled={lines.length === 1}
                  icon={<PortalIcon name="delete" />}
                  onClick={() => removeLineItem(line.key)}
                  type="text"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="quote-total-panel">
          <div className="form-group">
            <label htmlFor="quoteTax">Tax (%)</label>
            <input
              id="quoteTax"
              min="0"
              onChange={(event) => updateForm("tax", Number(event.target.value) || 0)}
              type="number"
              value={form.tax}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quoteDiscount">Discount</label>
            <input
              id="quoteDiscount"
              min="0"
              onChange={(event) => updateForm("discount", numberFromPrice(event.target.value))}
              type="number"
              value={form.discount}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quoteShippingFee">Shipping Fee</label>
            <input
              id="quoteShippingFee"
              min="0"
              onChange={(event) => updateForm("shippingFee", numberFromPrice(event.target.value))}
              type="number"
              value={form.shippingFee}
            />
          </div>
          <div className="quote-total-panel__summary">
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>-{money(discount)}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>{money(shippingFee)}</strong>
            </div>
            <div>
              <span>Tax amount</span>
              <strong>{money(taxAmount)}</strong>
            </div>
            <div className="quote-total-panel__grand">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
          </div>
        </div>

        <div className="quote-schedule-section">
          <Button onClick={() => setIsPaymentScheduleOpen((current) => !current)} type="default">
            Payment Schedule
          </Button>

          {isPaymentScheduleOpen ? (
            <div className="quote-schedule-panel">
              <div className="quote-schedule-options">
                <label className="quote-schedule-switch">
                  <span>Request Deposit Payment</span>
                  <Switch
                    checked={isDepositRequested}
                    onChange={toggleDepositRequest}
                  />
                </label>
                {isDepositRequested ? (
                  <label className="quote-schedule-switch">
                    <span>Split Balance</span>
                    <Switch
                      checked={isBalanceSplit}
                      onChange={setIsBalanceSplit}
                    />
                  </label>
                ) : null}
              </div>

              {!isDepositRequested && !isBalanceSplit ? (
                <Table
                  className="quote-schedule-ant-table"
                  columns={fullPaymentColumns}
                  dataSource={fullPaymentRows}
                  pagination={false}
                  rowKey="key"
                  size="small"
                />
              ) : null}

              {isDepositRequested ? (
                <section className="quote-schedule-block">
                  <h3>Deposit request</h3>
                  <Table
                    className="quote-schedule-ant-table"
                    columns={depositColumns}
                    dataSource={depositRows}
                    pagination={false}
                    rowKey="key"
                    size="small"
                  />
                  <p>
                    Request {money(normalizedDepositAmount)} deposit on {money(total)} invoice.
                  </p>
                </section>
              ) : null}

              {isBalanceSplit ? (
                <section className="quote-schedule-block">
                  <h3>Balance split</h3>
                  <Table
                    className="quote-schedule-ant-table"
                    columns={splitColumns}
                    dataSource={splitDisplayRows}
                    pagination={false}
                    rowKey="key"
                    size="small"
                  />
                  <Button onClick={addSplitRow} type="link">
                    Add Payment
                  </Button>
                  <p>
                    Schedule {money(splitSourceAmount)} over {splitDisplayRows.length} payments.
                  </p>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export default AdminQuoteModal;
