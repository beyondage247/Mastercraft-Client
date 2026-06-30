import { Pagination, Tabs, Table, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import { getCurrentPortalUser } from "../../auth/session";
import {
  createStaffUser,
  getStaffUsers,
  deactivateStaff,
  reactivateStaff,
  type CreateStaffInput,
  type StaffRecord,
} from "../../services/portalApi";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";
import { showRequestToast } from "../../utils/portalToast";
import ExportButton from '../../components/ExportButton';

type StaffFormState = CreateStaffInput;

const pageSize = 15;

const initialForm: StaffFormState = {
  email: "",
  isAdmin: false,
  name: "",
};

function AdminStaff() {
  const currentUser = getCurrentPortalUser();
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState<StaffFormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [activeTab, setActiveTab] = useState("active");

  const canManageStaff = currentUser?.role === "admin";

  async function fetchStaff() {
    try {
      const staff = await getStaffUsers();
      setStaffList(staff);
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(error.message || "Unable to load staff.");
      }
    }
  }

  useEffect(() => {
    if (!canManageStaff) {
      return;
    }

    let isMounted = true;

    getStaffUsers()
      .then((staff) => {
        if (isMounted) {
          setStaffList(staff);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setFeedback(error.message || "Unable to load staff.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [canManageStaff]);

  const sortedStaff = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filteredStaff = normalizedSearch
      ? staffList.filter((staff) =>
          [staff.name, staff.email, staff.role, staff.createdAt]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : staffList;

    return [...filteredStaff].sort((left, right) => left.name.localeCompare(right.name));
  }, [staffList, search]);

  const activeStaff = useMemo(() => sortedStaff.filter(s => s.isActive !== false), [sortedStaff]);
  const archivedStaff = useMemo(() => sortedStaff.filter(s => s.isActive === false), [sortedStaff]);

  const currentTabStaff = activeTab === "active" ? activeStaff : archivedStaff;

  useEffect(() => {
    setPage(1);
  }, [search, staffList, activeTab]);

  const paginatedStaff = useMemo(
    () => currentTabStaff.slice((page - 1) * pageSize, page * pageSize),
    [page, currentTabStaff],
  );

  function updateField<Field extends keyof StaffFormState>(
    field: Field,
    value: StaffFormState[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setFeedback("Staff name and email are required.");
      return;
    }

    const toast = showRequestToast("create-staff", "Creating staff account...");

    try {
      setIsSaving(true);
      const response = await createStaffUser({
        email,
        isAdmin: Boolean(form.isAdmin),
        name,
      });
      setForm(initialForm);
      setFeedback(response.message || `${name} was added.`);
      toast.success(response.message || `${name} was added.`);
      await fetchStaff();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add staff.";
      setFeedback(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(staffId: string, activate: boolean) {
    const toast = showRequestToast("toggle-staff", activate ? "Activating staff..." : "Deactivating staff...");
    try {
      if (activate) {
        await reactivateStaff(staffId);
      } else {
        await deactivateStaff(staffId);
      }
      toast.success(`Staff successfully ${activate ? "activated" : "deactivated"}.`);
      await fetchStaff();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${activate ? "activate" : "deactivate"} staff.`;
      toast.error(message);
    }
  }

  if (!canManageStaff) {
    return (
      <div className="page-stack admin-page">
        <PageHeader
          subtitle="Staff accounts can only be managed by admins."
          title="Staff"
        />
        <section className="panel">
          You do not have permission to manage staff accounts.
        </section>
      </div>
    );
  }

  const columns: ColumnsType<StaffRecord> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      key: "role",
      render: (_, staff) => {
        const isAdmin = staff.isAdmin || staff.role === "ADMIN";
        return (
          <StatusBadge tone={isAdmin ? "danger" : "info"}>
            {isAdmin ? "Admin" : "Staff"}
          </StatusBadge>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => <span>{formatPortalDateOrFallback(text)}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, staff) => {
        const isActive = staff.isActive !== false;
        return (
          <StatusBadge tone={isActive ? "success" : "neutral"}>
            {isActive ? "Active" : "Archived"}
          </StatusBadge>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, staff) => (
        <Button 
          type="primary" 
          danger={staff.isActive !== false}
          onClick={() => handleToggleStatus(staff.id, staff.isActive === false)}
        >
          {staff.isActive !== false ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Create staff access for the internal portal"
        title="Staff"
      />

      <section>
        <form className="panel admin-client-form" onSubmit={handleSubmit}>
          <div className="panel__header">
            <h2>Add Staff</h2>
            <StatusBadge tone="danger">Admin</StatusBadge>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="staffName">Name</label>
              <input
                id="staffName"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Jane Staff"
                type="text"
                value={form.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="staffEmail">Email</label>
              <input
                id="staffEmail"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="staff@mastercraft.com"
                type="email"
                value={form.email}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="staffRole">Role</label>
            <select
              id="staffRole"
              onChange={(event) =>
                updateField("isAdmin", event.target.value === "ADMIN")
              }
              value={form.isAdmin ? "ADMIN" : "STAFF"}
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="admin-form-actions">
            <button className="primary-action" disabled={isSaving} type="submit">
              <PortalIcon name="plus" />
              <span>{isSaving ? "Adding..." : "Add Staff"}</span>
            </button>
          </div>

          {feedback ? (
            <p className="admin-feedback" aria-live="polite">
              {feedback}
            </p>
          ) : null}
        </form>
      </section>

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Staff Accounts</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{currentTabStaff.length} total</span>
            <ExportButton
              data={currentTabStaff.map((s) => ({
                Name: s.name,
                Email: s.email,
                Role: s.isAdmin ? 'Admin' : 'Staff',
                Status: s.isActive === false ? 'Archived' : 'Active',
                Created: s.createdAt ? formatPortalDateOrFallback(s.createdAt) : '',
              }))}
              filename="staff"
              label="Export"
            />
          </div>
        </div>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'active', label: 'Staff' },
            { key: 'archived', label: 'Archived' }
          ]}
          style={{ padding: '0 24px' }}
        />

        <label className="admin-table-search">
          <PortalIcon name="search" />
          <input
            aria-label="Search staff"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search staff"
            type="search"
            value={search}
          />
        </label>
        
        <div style={{ padding: '0 24px 24px' }}>
          <Table 
            columns={columns}
            dataSource={paginatedStaff}
            rowKey="id"
            pagination={false}
          />
        </div>
        
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={currentTabStaff.length}
        />
      </section>
    </div>
  );
}

export default AdminStaff;
