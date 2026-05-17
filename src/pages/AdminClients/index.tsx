import { Pagination } from "antd";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import {
  createClient,
  getClients,
  type ClientRecord,
} from "../../services/portalApi";

type ClientFormState = {
  additionalEmail: string;
  additionalPhone: string;
  company: string;
  contactName: string;
  email: string;
  name: string;
  phone: string;
};

const initialForm: ClientFormState = {
  additionalEmail: "",
  additionalPhone: "",
  company: "",
  contactName: "",
  email: "",
  name: "",
  phone: "",
};

function AdminClients() {
  const [form, setForm] = useState<ClientFormState>(initialForm);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [clientList, setClientList] = useState<ClientRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    getClients()
      .then((clients) => {
        if (isMounted) {
          setClientList(clients);
        }
      })
      .catch(() => {
        if (isMounted) {
          setClientList([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clients = useMemo(() => clientList, [clientList]);
  const visibleClients = useMemo(() => {
    const start = (page - 1) * 25;

    return clients.slice(start, start + 25);
  }, [clients, page]);

  function updateField(field: keyof ClientFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name || !email || !phone) {
      setFeedback("Client name, email, and phone are required.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await createClient({
        ...form,
        additionalEmail: form.additionalEmail.trim(),
        additionalPhone: form.additionalPhone.trim(),
        company: form.company.trim(),
        email,
        name,
        phone,
      });
      setClientList((current) => [
        response,
        ...current.filter((client) => client.id !== response.id),
      ]);
      setForm(initialForm);
      setPage(1);
      setFeedback(
        response.temporaryPassword
          ? `${response.name || name} was added. Email sent to the client.`
          : `${response.name || name} was added.`,
      );
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to add client.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Create portal clients and trigger Monday onboarding"
        title="Admin Clients"
      />

      <section className="admin-grid">
        <form className="panel admin-client-form" onSubmit={handleSubmit}>
          <div className="panel__header">
            <h2>Add Client</h2>
            <StatusBadge tone="danger">Admin</StatusBadge>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Client name</label>
              <input
                id="clientName"
                name="clientName"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Amanda Jones"
                type="text"
                value={form.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientCompany">Company</label>
              <input
                id="clientCompany"
                name="clientCompany"
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="e.g. Chevron"
                type="text"
                value={form.company}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientEmail">Email</label>
              <input
                id="clientEmail"
                name="clientEmail"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="client@company.com"
                type="email"
                value={form.email}
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientPhone">Phone</label>
              <input
                id="clientPhone"
                name="clientPhone"
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+1 555 0100"
                type="tel"
                value={form.phone}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="additionalContact">Additional contact</label>
              <input
                id="additionalContact"
                name="additionalContact"
                onChange={(event) =>
                  updateField("contactName", event.target.value)
                }
                placeholder="e.g. Site manager"
                type="text"
                value={form.contactName}
              />
            </div>
            <div className="form-group">
              <label htmlFor="additionalEmail">Additional email</label>
              <input
                id="additionalEmail"
                name="additionalEmail"
                onChange={(event) =>
                  updateField("additionalEmail", event.target.value)
                }
                placeholder="secondary@company.com"
                type="email"
                value={form.additionalEmail}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="additionalPhone">Additional phone</label>
            <input
              id="additionalPhone"
              name="additionalPhone"
              onChange={(event) =>
                updateField("additionalPhone", event.target.value)
              }
              placeholder="5550101"
              type="tel"
              value={form.additionalPhone}
            />
          </div>

          <div className="admin-form-actions">
            <button
              className="primary-action"
              disabled={isSaving}
              type="submit"
            >
              <PortalIcon name="plus" />
              <span>{isSaving ? "Adding..." : "Add Client"}</span>
            </button>
          </div>

          {feedback ? (
            <p className="admin-feedback" aria-live="polite">
              {feedback}
            </p>
          ) : null}
        </form>

        <section className="panel admin-onboarding-panel">
          <h2>Client Access Flow</h2>
          <div className="admin-flow-list">
            <div>
              <span>1</span>
              <p>Admin submits this form.</p>
            </div>
            <div>
              <span>2</span>
              <p>Temporary password is created for the client.</p>
            </div>
            <div>
              <span>3</span>
              <p>Client signs in and replaces the temporary password.</p>
            </div>
          </div>
        </section>
      </section>

      <section className="panel admin-client-list">
        <div className="panel__header">
          <h2>Recent Clients</h2>
          <span>{clients.length} total</span>
        </div>
        <div className="admin-client-table">
          <div className="admin-client-table__head">
            <span>Name</span>
            <span>Company</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Additional Contact</span>
          </div>
          {visibleClients.map((client) => (
            <article className="admin-client-table__row" key={client.id}>
              <strong>{client.name}</strong>
              <span>{client.company || "Not set"}</span>
              <span>{client.email || "Not set"}</span>
              <span>{client.phone || "Not set"}</span>
              <span>
                {client.contactName ||
                  client.additionalEmail ||
                  client.additionalPhone ||
                  "Not set"}
              </span>
            </article>
          ))}
        </div>
        <Pagination
          className="admin-client-pagination"
          current={page}
          onChange={setPage}
          pageSize={25}
          showSizeChanger={false}
          total={clients.length}
        />
      </section>
    </div>
  );
}

export default AdminClients;
