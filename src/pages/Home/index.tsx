import { useMutation, useQuery } from "@apollo/client/react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PortalIcon } from "../../components/PortalIcon";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { activeProjects, homeMetrics, recentActivity } from "../../data/portal";
import { GET_CLIENTS } from "../../graphql/clients/queries";
import { ME } from "../../graphql/queries";
import type { DashboardResponse } from "../../services/portalApi";
import { getDashboard } from "../../services/portalApi";
import {
  CLIENT_BOARD_ID,
  CLIENT_EMAIL_COLUMN_ID,
  INVITE_CLIENT,
} from "../../graphql/clients/mutations";

function Home() {
  const { data } = useQuery<{ me?: { name?: string } }>(ME);
  const { data: clientsData } = useQuery<{
    boards?: Array<{
      items_page?: {
        items?: Array<{
          id: string;
          name: string;
          column_values?: Array<{
            id: string;
            text?: string | null;
            value?: string | null;
          }>;
        }>;
      };
    }>;
  }>(GET_CLIENTS, {
    variables: { boardId: [CLIENT_BOARD_ID] },
    skip: !CLIENT_BOARD_ID,
  });
  const [inviteClient, { loading: isInviting }] = useMutation<
    { create_item?: { name?: string } },
    { boardId: string; name: string; columnValues: string | null }
  >(INVITE_CLIENT);
  const name = data?.me?.name || "Valued Client";
  const [inviteForm, setInviteForm] = useState({
    clientName: "",
    clientEmail: "",
  });
  const [inviteFeedback, setInviteFeedback] = useState("");

  const [dashboard, setDashboard] = useState<DashboardResponse>({
    activeProjects,
    homeMetrics,
    projectMetrics: [],
    quoteMetrics: [],
    recentActivity,
  });

  useEffect(() => {
    let isMounted = true;

    getDashboard().then((data) => {
      if (isMounted) {
        setDashboard(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!clientsData) {
      return;
    }

    console.log(
      "CLIENTS",
      clientsData.boards?.[0]?.items_page?.items ?? [],
    );
  }, [clientsData]);

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientName = inviteForm.clientName.trim();
    const clientEmail = inviteForm.clientEmail.trim();

    if (!clientName || !clientEmail) {
      setInviteFeedback("Add a client name and email to test the invite form.");
      return;
    }

    if (!CLIENT_BOARD_ID) {
      setInviteFeedback("Set VITE_MONDAY_CLIENT_BOARD_ID before sending invites.");
      return;
    }

    setInviteFeedback("");

    try {
      const columnValues =
        CLIENT_EMAIL_COLUMN_ID && clientEmail
          ? JSON.stringify({
              [CLIENT_EMAIL_COLUMN_ID]: {
                email: clientEmail,
                text: clientEmail,
              },
            })
          : null;

      const response = await inviteClient({
        awaitRefetchQueries: true,
        refetchQueries: [
          {
            query: GET_CLIENTS,
            variables: { boardId: [CLIENT_BOARD_ID] },
          },
        ],
        variables: {
          boardId: CLIENT_BOARD_ID,
          name: clientName,
          columnValues,
        },
      });

      const invitedName = response.data?.create_item?.name || clientName;
      const feedback =
        clientEmail && !CLIENT_EMAIL_COLUMN_ID
          ? `Invited ${invitedName}. Email was not stored because the client email column is not configured.`
          : `Invited ${invitedName}.`;

      setInviteFeedback(feedback);
      setInviteForm({ clientName: "", clientEmail: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send invite.";
      setInviteFeedback(message);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Welcome back, {name}!</h1>
        <p>
          Welcome to the Mastercraft Products client portal. Track your
          fabrication projects, review quotes, and manage approvals all in one
          place.
        </p>
        <div className="hero-panel__actions">
          <Link className="portal-button portal-button--light" to="/new">
            <PortalIcon name="plus" />
            <span>New Project Request</span>
          </Link>
          <Link
            className="portal-button portal-button--outline-light"
            to="/quotes"
          >
            <PortalIcon name="folder" />
            <span>View Documents</span>
          </Link>
        </div>
      </section>

      <section
        className="metrics-grid metrics-grid--three"
        aria-label="Client portal summary"
      >
        {dashboard.homeMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-stack">
          <section className="panel invite-test-panel">
            <div className="invite-test-panel__header">
              <div>
                <h2>Invite Client</h2>
                <p>
                  Minimal form for testing a client invite flow on the home
                  page.
                </p>
              </div>
              <StatusBadge tone="neutral">Test</StatusBadge>
            </div>
            <form className="invite-test-form" onSubmit={handleInviteSubmit}>
              <div className="form-group">
                <label htmlFor="clientName">Client name</label>
                <input
                  id="clientName"
                  name="clientName"
                  placeholder="e.g. Ada Okafor"
                  type="text"
                  value={inviteForm.clientName}
                  onChange={(event) =>
                    setInviteForm((current) => ({
                      ...current,
                      clientName: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="clientEmail">Email</label>
                <input
                  id="clientEmail"
                  name="clientEmail"
                  placeholder="client@company.com"
                  type="email"
                  value={inviteForm.clientEmail}
                  onChange={(event) =>
                    setInviteForm((current) => ({
                      ...current,
                      clientEmail: event.target.value,
                    }))
                  }
                />
              </div>
              <button className="primary-action" disabled={isInviting} type="submit">
                {isInviting ? "Sending..." : "Send Test Invite"}
              </button>
            </form>
            <p className="invite-test-note">
              This test form now creates a client item through the invite mutation.
            </p>
            {inviteFeedback ? (
              <p className="invite-test-feedback" aria-live="polite">
                {inviteFeedback}
              </p>
            ) : null}
          </section>

          <section className="panel">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link className="quick-action quick-action--primary" to="/new">
                <PortalIcon name="plus" />
                <span>Submit Project Request</span>
              </Link>
              <Link className="quick-action" to="/quotes">
                <PortalIcon name="plus" />
                <span>Review Quote Request</span>
              </Link>
            </div>
          </section>

          <section className="panel active-projects-panel">
            <div className="panel__header">
              <h2>Active Projects</h2>
              <Link to="/projects">View All</Link>
            </div>
            <div className="active-project-list">
              {dashboard.activeProjects.map((project) => (
                <article className="active-project-row" key={project.name}>
                  <PortalIcon name="file" />
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.location}</p>
                  </div>
                  <div className="active-project-row__meta">
                    <strong>{project.category}</strong>
                    <span>{project.estimate}</span>
                  </div>
                  <StatusBadge tone={project.tone}>
                    {project.status}
                  </StatusBadge>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="panel recent-activity-panel">
          <h2>Recent Activity</h2>
          <div className="timeline" aria-label="Recent activity timeline">
            {dashboard.recentActivity.map((activity, index) => (
              <article
                className={`timeline-item timeline-item--${index % 2 === 0 ? "right" : "left"}`}
                key={activity.title}
              >
                <span className="timeline-item__node">
                  <PortalIcon name="tool" />
                </span>
                <div className="timeline-card">
                  <h3>{activity.title}</h3>
                  <p>{activity.project}</p>
                  <span>
                    <PortalIcon name="clock" />
                    {activity.time}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <button className="secondary-action" type="button">
            View all Activity
          </button>
        </section>
      </section>
    </div>
  );
}

export default Home;
