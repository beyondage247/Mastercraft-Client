import { Button, Divider, Input, Select } from "antd";
import { useState } from "react";
import { createQuoteCategory, type QuoteCategory } from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";

type QuoteCategorySelectProps = {
  categories: QuoteCategory[];
  id?: string;
  loading?: boolean;
  onCategoryCreated: (category: QuoteCategory) => void;
  onChange: (categoryId: string) => void;
  value: string;
};

function QuoteCategorySelect({
  categories,
  id,
  loading = false,
  onCategoryCreated,
  onChange,
  value,
}: QuoteCategorySelectProps) {
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    const name = newName.trim();

    if (!name) {
      return;
    }

    const existing = categories.find((category) => category.name.toLowerCase() === name.toLowerCase());

    if (existing) {
      onChange(existing.id);
      setNewName("");
      return;
    }

    const toast = showRequestToast("create-quote-category", "Adding category...");

    try {
      setIsCreating(true);
      const category = await createQuoteCategory(name);
      onCategoryCreated(category);
      onChange(category.id);
      setNewName("");
      toast.success(`Category "${category.name}" added.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add category.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Select
      allowClear
      id={id}
      loading={loading}
      onChange={(next) => onChange(next ?? "")}
      optionFilterProp="label"
      options={categories.map((category) => ({ label: category.name, value: category.id }))}
      placeholder="Select a category (e.g. Residential)"
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <div style={{ display: "flex", gap: 8, padding: "0 8px 4px" }}>
            <Input
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="New category name"
              value={newName}
            />
            <Button disabled={!newName.trim()} loading={isCreating} onClick={() => void handleCreate()}>
              Add
            </Button>
          </div>
        </>
      )}
      showSearch
      style={{ width: "100%" }}
      value={value || undefined}
    />
  );
}

export default QuoteCategorySelect;
