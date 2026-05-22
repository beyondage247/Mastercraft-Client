import { Dropdown, Modal, Pagination, Tabs, type MenuProps } from "antd";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getCurrentPortalUser } from "../../auth/session";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import {
  createClient,
  getClients,
  getStaffUsers,
  reassignClient,
  type ClientRecord,
  type StaffRecord,
} from "../../services/portalApi";
import {
  listProjectsForClient,
  saveBackOfficeProject,
  type BackOfficeProject,
} from "../../services/backOfficeStore";

type ClientFormState = {
  additionalEmail: string;
  assignmentId: string;
  clientCredit: "COD" | "CREDIT_ACCOUNT";
  company: string;
  contactName: string;
  email: string;
  name: string;
  phone: string;
};

const initialForm: ClientFormState = {
  additionalEmail: "",
  assignmentId: "",
  clientCredit: "COD",
  company: "",
  contactName: "",
  email: "",
  name: "",
  phone: "",
};

type ProjectFormState = {
  description: string;
  estimatedCompletion: string;
  location: string;
  name: string;
  startDate: string;
  status: string;
};

const initialProjectForm: ProjectFormState = {
  description: "",
  estimatedCompletion: "",
  location: "",
  name: "",
  startDate: "",
  status: "Pending",
};

function clientProjects(clientId?: string) {
  return clientId ? listProjectsForClient(clientId) : [];
}

function AdminClients() {
  const currentUser = getCurrentPortalUser();
  const isAdmin = currentUser?.role === "admin";
  const [form, setForm] = useState<ClientFormState>(initialForm);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [page, setPage] = useState(1);
  const [clientList, setClientList] = useState<ClientRecord[]>([]);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(initialProjectForm);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignStaffId, setReassignStaffId] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [viewClientOpen, setViewClientOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getClients()
      .then((clients) => {
        if (isMounted) {
          setClientList(clients);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setClientList([]);
          setFeedback(error.message || "Unable to load clients.");
        }
      });

    getStaffUsers()
      .then((staff) => {
        if (isMounted) {
          setStaffList(staff);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const clients = useMemo(() => clientList, [clientList]);
  const visibleClients = useMemo(() => {
    const start = (page - 1) * 25;

    return clients.slice(start, start + 25);
  }, [clients, page]);

  function updateField(field: keyof ClientFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value } as ClientFormState));
  }

  function updateProjectField(field: keyof ProjectFormState, value: string) {
    setProjectForm((current) => ({ ...current, [field]: value }));
  }

  function openClientDetails(client: ClientRecord) {
    setSelectedClient(client);
    setViewClientOpen(true);
  }

  function openCreateProject(client: ClientRecord) {
    setSelectedClient(client);
    setProjectForm(initialProjectForm);
    setCreateProjectOpen(true);
  }

  function openReassign(client: ClientRecord) {
    setSelectedClient(client);
    setReassignStaffId(client.accountPartnerId || "");
    setReassignOpen(true);
  }

  function actionMenu(client: ClientRecord): MenuProps {
    return {
      items: [
        { key: "view", label: "View" },
        { key: "create-project", label: "Create project" },
        ...(isAdmin ? [{ key: "reassign", label: "Reassign" }] : []),
      ],
      onClick: ({ key }) => {
        if (key === "view") {
          openClientDetails(client);
          return;
        }

        if (key === "reassign") {
          openReassign(client);
          return;
        }

        openCreateProject(client);
      },
    };
  }

  function staffName(staffId?: string) {
    if (!staffId) {
      return "Not assigned";
    }

    const staff = staffList.find((item) => item.id === staffId);

    if (!staff) {
      return staffId;
    }

    return `${staff.name}${staff.isAdmin || staff.role === "ADMIN" ? " (Admin)" : ""}`;
  }

  function assignmentName() {
    if (isAdmin) {
      return form.assignmentId ? staffName(form.assignmentId) : `${currentUser?.name || "Me"} (me)`;
    }

    return currentUser?.name || "Assigned to me";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const company = form.company.trim();
    const contactName = form.contactName.trim();
    const additionalEmail = form.additionalEmail.trim();

    if (!name || !email || !phone || !company || !contactName || !additionalEmail) {
      setFeedback("Client name, email, phone, company, additional contact, and additional email are required.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await createClient({
        additionalEmail,
        assignmentId: form.assignmentId || currentUser?.clientItemId,
        clientCredit: form.clientCredit,
        company,
        contactName,
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
      setFeedback(`${response.name || name} was added.`);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to add client.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReassignClient() {
    if (!selectedClient || !reassignStaffId) {
      setFeedback("Choose a staff member before reassigning.");
      return;
    }

    try {
      setIsReassigning(true);
      const response = await reassignClient(selectedClient.id, reassignStaffId);
      setClientList((current) =>
        current.map((client) =>
          client.id === selectedClient.id
            ? { ...client, accountPartnerId: reassignStaffId }
            : client,
        ),
      );
      setReassignOpen(false);
      setFeedback(response.message || `${selectedClient.name} was reassigned.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to reassign client.");
    } finally {
      setIsReassigning(false);
    }
  }

  function handleCreateProject() {
    if (!selectedClient) {
      return;
    }

    const projectName = projectForm.name.trim();

    if (!projectName) {
      setFeedback("Project name is required.");
      return;
    }

    const project: BackOfficeProject = saveBackOfficeProject({
      clientEmail: selectedClient.email,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      createdAt: new Date().toISOString(),
      description: projectForm.description.trim(),
      estimatedCompletion: projectForm.estimatedCompletion,
      id: `project-${crypto.randomUUID()}`,
      location: projectForm.location.trim(),
      name: projectName,
      startDate: projectForm.startDate,
      status: projectForm.status,
    });

    setCreateProjectOpen(false);
    setProjectForm(initialProjectForm);
    setFeedback(`${project.name} was created for ${selectedClient.name}.`);
  }

  const selectedClientProjects = clientProjects(selectedClient?.id);

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle="Create portal clients and manage database-backed access"
        title="Admin Clients"
      />

      <section>
        <form className="panel admin-client-form" onSubmit={handleSubmit}>
          <div className="panel__header">
            <h2>Add Client</h2>
            <StatusBadge tone="danger">{isAdmin ? "Admin" : "Staff"}</StatusBadge>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientCredit">Client credit</label>
              <select
                id="clientCredit"
                onChange={(event) =>
                  updateField("clientCredit", event.target.value)
                }
                value={form.clientCredit}
              >
                <option value="COD">COD</option>
                <option value="CREDIT_ACCOUNT">Credit account</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="assignmentId">Assignment</label>
              {isAdmin ? (
                <select
                  id="assignmentId"
                  onChange={(event) =>
                    updateField("assignmentId", event.target.value)
                  }
                  value={form.assignmentId}
                >
                  <option value="">Assign to me</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} {staff.isAdmin || staff.role === "ADMIN" ? "(Admin)" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="assignmentId"
                  readOnly
                  type="text"
                  value={assignmentName()}
                />
              )}
            </div>
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
            <span>Assignment</span>
            <span>Action</span>
          </div>
          {visibleClients.map((client) => (
            <article className="admin-client-table__row" key={client.id}>
              <strong>{client.name}</strong>
              <span>{client.company || "Not set"}</span>
              <span>{client.email || "Not set"}</span>
              <span>{client.phone || "Not set"}</span>
              <span>{isAdmin ? staffName(client.accountPartnerId) : assignmentName()}</span>
              <span>
                <Dropdown menu={actionMenu(client)} placement="bottomRight">
                  <button className="table-action-button" type="button">
                    <span>Actions</span>
                    <PortalIcon name="down" />
                  </button>
                </Dropdown>
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

      <Modal
        footer={null}
        onCancel={() => setViewClientOpen(false)}
        open={viewClientOpen}
        title={selectedClient?.name || "Client details"}
        width={860}
      >
        {selectedClient ? (
          <Tabs
            items={[
              {
                key: "details",
                label: "Detail",
                children: (
                  <div className="admin-detail-grid">
                    <div>
                      <span>Name</span>
                      <strong>{selectedClient.name}</strong>
                    </div>
                    <div>
                      <span>Company</span>
                      <strong>{selectedClient.company || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{selectedClient.email || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>{selectedClient.phone || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Contact</span>
                      <strong>{selectedClient.contactName || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Additional email</span>
                      <strong>{selectedClient.additionalEmail || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Credit</span>
                      <strong>{selectedClient.clientCredit || "Not set"}</strong>
                    </div>
                    <div>
                      <span>Account partner</span>
                      <strong>{staffName(selectedClient.accountPartnerId)}</strong>
                    </div>
                  </div>
                ),
              },
              {
                key: "projects",
                label: "Projects",
                children: selectedClientProjects.length ? (
                  <div className="admin-modal-list">
                    {selectedClientProjects.map((project) => (
                      <article key={project.id}>
                        <div>
                          <strong>{project.name}</strong>
                          <span>{project.location || "No location"}</span>
                        </div>
                        <StatusBadge tone="neutral">{project.status}</StatusBadge>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="admin-empty-copy">
                    No projects have been attached to this client yet.
                  </p>
                ),
              },
            ]}
          />
        ) : null}
      </Modal>

      <Modal
        okText="Create project"
        onCancel={() => setCreateProjectOpen(false)}
        onOk={handleCreateProject}
        open={createProjectOpen}
        title={`Create project${selectedClient ? ` for ${selectedClient.name}` : ""}`}
        width={760}
      >
        <div className="admin-modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">Project name</label>
              <input
                id="projectName"
                onChange={(event) => updateProjectField("name", event.target.value)}
                placeholder="e.g. Lekki Showroom Buildout"
                type="text"
                value={projectForm.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectStatus">Status</label>
              <select
                id="projectStatus"
                onChange={(event) => updateProjectField("status", event.target.value)}
                value={projectForm.status}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>In Design</option>
                <option>In Fabrication</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="projectLocation">Location</label>
            <input
              id="projectLocation"
              onChange={(event) => updateProjectField("location", event.target.value)}
              placeholder="Project location"
              type="text"
              value={projectForm.location}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectStartDate">Start date</label>
              <input
                id="projectStartDate"
                onChange={(event) => updateProjectField("startDate", event.target.value)}
                type="date"
                value={projectForm.startDate}
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectCompletion">Estimated completion</label>
              <input
                id="projectCompletion"
                onChange={(event) => updateProjectField("estimatedCompletion", event.target.value)}
                type="date"
                value={projectForm.estimatedCompletion}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              onChange={(event) => updateProjectField("description", event.target.value)}
              placeholder="Scope, notes, or delivery expectations"
              rows={4}
              value={projectForm.description}
            />
          </div>
        </div>
      </Modal>

      <Modal
        okButtonProps={{ disabled: !reassignStaffId, loading: isReassigning }}
        okText="Reassign client"
        onCancel={() => setReassignOpen(false)}
        onOk={handleReassignClient}
        open={reassignOpen}
        title={`Reassign${selectedClient ? ` ${selectedClient.name}` : " client"}`}
      >
        <div className="admin-modal-form">
          <div className="form-group">
            <label htmlFor="reassignStaff">Account partner</label>
            <select
              id="reassignStaff"
              onChange={(event) => setReassignStaffId(event.target.value)}
              value={reassignStaffId}
            >
              <option value="">Select staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} {staff.isAdmin || staff.role === "ADMIN" ? "(Admin)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminClients;
