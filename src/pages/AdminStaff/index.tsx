import { Pagination } from "antd";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import { getCurrentPortalUser } from "../../auth/session";
import {
  createStaffUser,
  getStaffUsers,
  type CreateStaffInput,
  type StaffRecord,
} from "../../services/portalApi";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";
import { showRequestToast } from "../../utils/portalToast";

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

  const canManageStaff = currentUser?.role === "admin";

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

  useEffect(() => {
    setPage(1);
  }, [search, staffList]);

  const paginatedStaff = useMemo(
    () => sortedStaff.slice((page - 1) * pageSize, page * pageSize),
    [page, sortedStaff],
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

      const staff = await getStaffUsers();
      setStaffList(staff);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add staff.";

      setFeedback(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
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
          <span>{sortedStaff.length} total</span>
        </div>
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
        <div className="admin-client-table admin-client-table--staff">
          <div className="admin-client-table__head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Created</span>
            <span>Status</span>
          </div>
          {paginatedStaff.map((staff) => (
            <article className="admin-client-table__row" key={staff.id}>
              <strong>{staff.name}</strong>
              <span>{staff.email}</span>
              <span>{staff.isAdmin || staff.role === "ADMIN" ? "ADMIN" : "STAFF"}</span>
              <span>{formatPortalDateOrFallback(staff.createdAt)}</span>
              <span>Active</span>
            </article>
          ))}
        </div>
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={pageSize}
          showSizeChanger={false}
          total={sortedStaff.length}
        />
      </section>
    </div>
  );
}

export default AdminStaff;
