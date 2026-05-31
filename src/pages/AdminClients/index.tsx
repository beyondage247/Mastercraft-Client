import { DatePicker, Dropdown, Modal, Pagination, Tabs, type MenuProps } from "antd";
import dayjs from "dayjs";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getCurrentPortalUser } from "../../auth/session";
import AdminPaymentModal from "../../components/AdminPaymentModal";
import AdminProjectDetailModal from "../../components/AdminProjectDetailModal";
import AdminQuoteModal from "../../components/AdminQuoteModal";
import AdminProjectStatusModal from "../../components/AdminProjectStatusModal";
import AdminProjectTable from "../../components/AdminProjectTable";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import {
  calculateFabricationProgress,
  calculateStageProgress,
  createClient,
  createProject,
  getClients,
  getProjectsForClient,
  getStaffUsers,
  reassignClient,
  type ClientRecord,
  type ProjectStageInput,
  type StaffRecord,
} from "../../services/portalApi";
import type { ProjectListItem } from "../../data/portal";
import { formatPortalDateOrFallback } from "../../utils/dateFormat";
import { showRequestToast } from "../../utils/portalToast";

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
  buildAssemble: ProjectStageFormState;
  delivery: ProjectStageFormState;
  description: string;
  endDate: string;
  finishing: ProjectStageFormState;
  install: ProjectStageFormState;
  location: string;
  mil: ProjectStageFormState;
  name: string;
  startDate: string;
};

type ProjectStageKey = "mil" | "buildAssemble" | "finishing" | "delivery" | "install";

type ProjectStageFormState = {
  hoursBudgeted: string;
  hoursSpent: string;
  startDate: string;
};

const initialProjectForm: ProjectFormState = {
  buildAssemble: { hoursBudgeted: "", hoursSpent: "0", startDate: "" },
  delivery: { hoursBudgeted: "", hoursSpent: "0", startDate: "" },
  description: "",
  endDate: "",
  finishing: { hoursBudgeted: "", hoursSpent: "0", startDate: "" },
  install: { hoursBudgeted: "", hoursSpent: "0", startDate: "" },
  location: "",
  mil: { hoursBudgeted: "", hoursSpent: "0", startDate: "" },
  name: "",
  startDate: "",
};

const projectStageFields: Array<{ key: ProjectStageKey; label: string }> = [
  { key: "mil", label: "MIL" },
  { key: "buildAssemble", label: "Build/Assemble" },
  { key: "finishing", label: "Finishing" },
  { key: "delivery", label: "Delivery" },
  { key: "install", label: "Install" },
];

function portalDateValue(value: string) {
  if (!value) {
    return null;
  }

  const [year, day, month] = value.split("/");

  if (year && day && month) {
    return dayjs(`${year}-${month}-${day}`);
  }

  return dayjs(value);
}

function portalDateText(date: dayjs.Dayjs | null) {
  return date ? date.format("YYYY/DD/MM") : "";
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
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoadingClientProjects, setIsLoadingClientProjects] = useState(false);
  const [paymentProject, setPaymentProject] = useState<ProjectListItem | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(initialProjectForm);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignStaffId, setReassignStaffId] = useState("");
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(null);
  const [quoteProject, setQuoteProject] = useState<ProjectListItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectListItem | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [selectedClientProjects, setSelectedClientProjects] = useState<ProjectListItem[]>([]);
  const [search, setSearch] = useState("");
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

  const clients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return clientList;
    }

    return clientList.filter((client) =>
      [
        client.name,
        client.company,
        client.email,
        client.phone,
        client.createdAt,
        client.accountPartner?.name,
        client.accountPartner?.email,
        client.contactName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [clientList, search]);
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

  function updateProjectStageField(stage: ProjectStageKey, field: keyof ProjectStageFormState, value: string) {
    setProjectForm((current) => ({
      ...current,
      [stage]: {
        ...current[stage],
        [field]: value,
      },
    }));
  }

  async function loadProjectsForClient(client: ClientRecord) {
    setIsLoadingClientProjects(true);

    try {
      const projects = await getProjectsForClient(client.id);
      setSelectedClientProjects(projects);
    } catch (error) {
      setSelectedClientProjects([]);
      setFeedback(error instanceof Error ? error.message : "Unable to load projects for this client.");
    } finally {
      setIsLoadingClientProjects(false);
    }
  }

  function openClientDetails(client: ClientRecord) {
    setSelectedClient(client);
    setSelectedClientProjects([]);
    setViewClientOpen(true);
    void loadProjectsForClient(client);
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

  function numberValue(value: string) {
    return Number(value) || 0;
  }

  function stageInput(stage: ProjectStageKey): ProjectStageInput {
    return {
      hoursBudgeted: numberValue(projectForm[stage].hoursBudgeted),
      hoursSpent: numberValue(projectForm[stage].hoursSpent),
      startDate: projectForm[stage].startDate || projectForm.startDate,
    };
  }

  function stageProgressValue(stage: ProjectStageKey) {
    return calculateStageProgress(
      numberValue(projectForm[stage].hoursBudgeted),
      numberValue(projectForm[stage].hoursSpent),
    );
  }

  const fabricationProgress = calculateFabricationProgress({
    buildAssemble: {
      hoursBudgeted: numberValue(projectForm.buildAssemble.hoursBudgeted),
      hoursSpent: numberValue(projectForm.buildAssemble.hoursSpent),
      progress: stageProgressValue("buildAssemble"),
    },
    finishing: {
      hoursBudgeted: numberValue(projectForm.finishing.hoursBudgeted),
      hoursSpent: numberValue(projectForm.finishing.hoursSpent),
      progress: stageProgressValue("finishing"),
    },
    mil: {
      hoursBudgeted: numberValue(projectForm.mil.hoursBudgeted),
      hoursSpent: numberValue(projectForm.mil.hoursSpent),
      progress: stageProgressValue("mil"),
    },
  });

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

  function handleCreateQuote(project: ProjectListItem) {
    setQuoteProject(project);
  }

  function handleProjectSaved(project: ProjectListItem) {
    setSelectedClientProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item)),
    );
    setSelectedProject((current) => (current?.id === project.id ? project : current));
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

  function staffAssignment(client: ClientRecord) {
    const partnerName = client.accountPartner?.name;
    const partnerEmail = client.accountPartner?.email;

    if (partnerName && partnerEmail) {
      return `${partnerName} (${partnerEmail})`;
    }

    if (partnerName || partnerEmail) {
      return partnerName || partnerEmail || "Not assigned";
    }

    return isAdmin ? staffName(client.accountPartnerId) : assignmentName();
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

    const toast = showRequestToast("create-client", "Creating client...");

    try {
      setIsSaving(true);
      const response = await createClient({
        additionalEmail,
        clientCredit: form.clientCredit,
        company,
        contactName,
        email,
        name,
        phone,
        staffId: form.assignmentId || currentUser?.clientItemId,
      });
      setClientList((current) => [
        response,
        ...current.filter((client) => client.id !== response.id),
      ]);
      setForm(initialForm);
      setPage(1);
      setFeedback(`${response.name || name} was added.`);
      toast.success(`${response.name || name} was added.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add client.";

      setFeedback(message);
      toast.error(message);
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

  async function handleCreateProject() {
    if (!selectedClient) {
      return;
    }

    const projectName = projectForm.name.trim();
    const description = projectForm.description.trim();
    const location = projectForm.location.trim();

    if (!projectName || !description || !location || !projectForm.startDate || !projectForm.endDate) {
      setFeedback("Project name, description, location, start date, and end date are required.");
      return;
    }

    const missingStageBudget = projectStageFields.some(
      ({ key }) => !numberValue(projectForm[key].hoursBudgeted),
    );

    if (missingStageBudget) {
      setFeedback("Budgeted hours are required for every project stage.");
      return;
    }

    const toast = showRequestToast("create-project", "Creating project...");

    try {
      setIsCreatingProject(true);
      const project = await createProject({
        buildAssemble: stageInput("buildAssemble"),
        clientId: selectedClient.id,
        delivery: stageInput("delivery"),
        description,
        endDate: projectForm.endDate,
        finishing: stageInput("finishing"),
        install: stageInput("install"),
        location,
        mil: stageInput("mil"),
        name: projectName,
        startDate: projectForm.startDate,
      });

      setSelectedClientProjects((current) => [
        project,
        ...current.filter((item) => item.id !== project.id),
      ]);
      setCreateProjectOpen(false);
      setProjectForm(initialProjectForm);
      setFeedback(`${project.title || projectName} was created for ${selectedClient.name}.`);
      toast.success(`${project.title || projectName} was created for ${selectedClient.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create project.";

      setFeedback(message);
      toast.error(message);
    } finally {
      setIsCreatingProject(false);
    }
  }

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
        <label className="admin-table-search">
          <PortalIcon name="search" />
          <input
            aria-label="Search clients"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search clients"
            type="search"
            value={search}
          />
        </label>
        <div className="admin-client-table">
          <div className="admin-client-table__head">
            <span>Name</span>
            <span>Company</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Created</span>
            <span>Assignment</span>
            <span>Action</span>
          </div>
          {visibleClients.map((client) => (
            <article className="admin-client-table__row" key={client.id}>
              <strong>{client.name}</strong>
              <span>{client.company || "Not set"}</span>
              <span>{client.email || "Not set"}</span>
              <span>{client.phone || "Not set"}</span>
              <span>{formatPortalDateOrFallback(client.createdAt)}</span>
              <span>{staffAssignment(client)}</span>
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
        style={{ maxWidth: "calc(100vw - 32px)" }}
        title={selectedClient?.name || "Client details"}
        width={1320}
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
                      <span>Team Project</span>
                      <strong>{staffAssignment(selectedClient)}</strong>
                    </div>
                  </div>
                ),
              },
              {
                key: "projects",
                label: "Projects",
                children: isLoadingClientProjects ? (
                  <p className="admin-empty-copy">Loading projects...</p>
                ) : selectedClientProjects.length ? (
                  <AdminProjectTable
                    emptyMessage="No projects have been attached to this client yet."
                    onCreateQuote={handleCreateQuote}
                    onEdit={setEditingProject}
                    onRecordPayment={setPaymentProject}
                    onView={setSelectedProject}
                    projects={selectedClientProjects}
                  />
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
        okButtonProps={{ loading: isCreatingProject }}
        okText="Create project"
        onCancel={() => setCreateProjectOpen(false)}
        onOk={handleCreateProject}
        open={createProjectOpen}
        title={`Create project${selectedClient ? ` for ${selectedClient.name}` : ""}`}
        width={760}
      >
        <div className="admin-modal-form">
          <div className="form-group  ">
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
              <DatePicker
                format="YYYY/DD/MM"
                id="projectStartDate"
                onChange={(date) => updateProjectField("startDate", portalDateText(date))}
                value={portalDateValue(projectForm.startDate)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectCompletion">Estimated completion</label>
              <DatePicker
                format="YYYY/DD/MM"
                id="projectCompletion"
                onChange={(date) => updateProjectField("endDate", portalDateText(date))}
                value={portalDateValue(projectForm.endDate)}
              />
            </div>
          </div>
          <div className="admin-stage-summary">
            <span>Fabrication</span>
            <strong>{fabricationProgress}%</strong>
          </div>
          <div className="admin-stage-grid">
            {projectStageFields.map((stage) => (
              <fieldset key={stage.key}>
                <legend>{stage.label}</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`${stage.key}Budgeted`}>Hours budgeted</label>
                    <input
                      id={`${stage.key}Budgeted`}
                      min="0"
                      onChange={(event) =>
                        updateProjectStageField(stage.key, "hoursBudgeted", event.target.value)
                      }
                      type="number"
                      value={projectForm[stage.key].hoursBudgeted}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`${stage.key}Spent`}>Hours spent</label>
                    <input
                      id={`${stage.key}Spent`}
                      min="0"
                      onChange={(event) =>
                        updateProjectStageField(stage.key, "hoursSpent", event.target.value)
                      }
                      type="number"
                      value={projectForm[stage.key].hoursSpent}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`${stage.key}Start`}>Stage start</label>
                    <DatePicker
                      format="YYYY/DD/MM"
                      id={`${stage.key}Start`}
                      onChange={(date) =>
                        updateProjectStageField(stage.key, "startDate", portalDateText(date))
                      }
                      value={portalDateValue(projectForm[stage.key].startDate)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Progress</label>
                    <input readOnly type="text" value={`${stageProgressValue(stage.key)}%`} />
                  </div>
                </div>
              </fieldset>
            ))}
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

      <AdminProjectDetailModal
        onClose={() => setSelectedProject(null)}
        onProjectUpdated={handleProjectSaved}
        open={Boolean(selectedProject)}
        project={selectedProject}
      />
      <AdminProjectStatusModal
        onClose={() => setEditingProject(null)}
        onSaved={handleProjectSaved}
        open={Boolean(editingProject)}
        project={editingProject}
      />
      <AdminQuoteModal
        onClose={() => setQuoteProject(null)}
        onCreated={() => {
          if (selectedClient) {
            loadProjectsForClient(selectedClient);
          }
        }}
        open={Boolean(quoteProject)}
        project={quoteProject}
      />
      <AdminPaymentModal
        onClose={() => setPaymentProject(null)}
        open={Boolean(paymentProject)}
        project={paymentProject}
      />
    </div>
  );
}

export default AdminClients;
