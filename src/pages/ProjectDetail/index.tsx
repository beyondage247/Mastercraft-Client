import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import { getProjectDetail, getProjectPayments, type ProjectPaymentSummary } from "../../services/portalApi";
import type { ProjectListItem, ProjectDetailInfo } from "../../data/portal";

// const projectStatusTone = {
//   Completed: 'success',
//   'In Design': 'info',
//   'In Fabrication': 'danger',
//   Pending: 'danger',
// } as const;

function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectListItem | null>(null);
  const [details, setDetails] = useState<ProjectDetailInfo | null>(null);
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Document" | "Activity" | "Payment"
  >("Overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentSummary, setPaymentSummary] = useState<ProjectPaymentSummary | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError("");

      getProjectDetail(id)
        .then((data) => {
          if (data.project) setProject(data.project);
          if (data.details) setDetails(data.details);
        })
        .catch((requestError: Error) => {
          setError(requestError.message || "Unable to load this project.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (!project) {
      return;
    }

    let isMounted = true;
    setPaymentLoading(true);

    getProjectPayments(project.id)
      .then((summary) => {
        if (isMounted) {
          setPaymentSummary(summary);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPaymentSummary(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setPaymentLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [project]);

  if (loading) {
    return <div className="page-stack">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="page-stack">
        <button className="back-link" onClick={() => navigate("/projects")}>
          <PortalIcon name="left" /> Back to Projects
        </button>
        <div className="panel">{error || "Project not found"}</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <button className="back-link" onClick={() => navigate("/projects")}>
        <PortalIcon name="left" /> Back to Projects
      </button>

      <div className="project-detail-header">
        <div className="project-detail-header__top">
          <PortalIcon name="projects" /> {project.category} PROJECT
        </div>
        <h1>{project.title}</h1>
        <div className="project-detail-header__meta">
          <span>
            <PortalIcon name="location" /> {project.location}
          </span>
          <span>
            <PortalIcon name="calendar" /> Due: {project.dueDate}
          </span>
        </div>
        <div className="project-detail-header__actions">
          <StatusBadge tone="neutral">{project.status}</StatusBadge>
          {/*   <button className="edit-button">Edit</button> */}
        </div>
      </div>

      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === "Overview" ? "active" : ""}`}
          onClick={() => setActiveTab("Overview")}
        >
          Overview
        </button>
        <button
          className={`detail-tab ${activeTab === "Document" ? "active" : ""}`}
          onClick={() => setActiveTab("Document")}
        >
          Document <span className="detail-tab-count">4</span>
        </button>
        <button
          className={`detail-tab ${activeTab === "Activity" ? "active" : ""}`}
          onClick={() => setActiveTab("Activity")}
        >
          Activity <span className="detail-tab-count">4</span>
        </button>
        <button
          className={`detail-tab ${activeTab === "Payment" ? "active" : ""}`}
          onClick={() => setActiveTab("Payment")}
        >
          Payment
        </button>
      </div>

      {activeTab === "Overview" && details && (
        <div className="detail-grid">
          <div className="detail-grid-left">
            <div className="detail-panel">
              <h3>Project Specifications</h3>
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-label">START DATE</span>
                  <span className="spec-value">{details.startDate}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">ESTIMATED COMPLETION</span>
                  <span className="spec-value">
                    {details.estimatedCompletion}
                  </span>
                </div>
                <div className="spec-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="spec-label">SITE ADDRESS</span>
                  <span className="spec-value">{details.siteAddress}</span>
                </div>
              </div>
              <div className="spec-notes">
                <span
                  className="spec-label"
                  style={{ display: "block", marginBottom: "8px" }}
                >
                  NOTES
                </span>
                <p>{details.notes}</p>
              </div>
            </div>

            <div className="detail-panel">
              <h3>
                Project Timeline <Link to="#">View all</Link>
              </h3>
              <div className="timeline-list">
                {details.timeline.map((event, index) => (
                  <div className="timeline-row" key={index}>
                    <div className="timeline-icon">
                      <PortalIcon name="clock" />
                    </div>
                    <div className="timeline-content">
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                    </div>
                    <div className="timeline-date">{event.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-grid-right">
            <div className="detail-panel">
              <h3>
                Related Quotes <Link to="#">View all</Link>
              </h3>
              <div className="quote-row">
                <h4>QT-2024-0089</h4>
                <p>Initial millwork package including kitchen and built-ins</p>
                <div className="quote-footer">
                  <span className="quote-amount">$45,000</span>
                  <span className="quote-status">Approved</span>
                </div>
              </div>
            </div>

            <div className="detail-panel">
              <h3>Project Team</h3>
              {details.team.map((member, index) => (
                <div className="team-row" key={index}>
                  <div className="team-avatar">{member.initials}</div>
                  <div className="team-info">
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                  </div>
                  <button className="team-message">
                    <PortalIcon name="messages" />
                  </button>
                </div>
              ))}
              <button className="manage-team-btn">Manage Team</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Document" && (
        <div className="detail-panel">
          <h3>Project Documents</h3>
          <div className="document-list">
            <div className="document-row">
              <div className="document-icon">
                <PortalIcon name="file" />
              </div>
              <div className="document-info">
                <h4>Main Unit Shop Drawings - Rev A</h4>
                <p>Uploaded Mar 15, 2024</p>
              </div>
              <div className="document-actions">
                <span className="document-type-badge">Shop Drawing</span>
                <button className="document-download">
                  <PortalIcon name="download" />
                </button>
                <button className="document-more">⋮</button>
              </div>
            </div>
            <div className="document-row">
              <div className="document-icon">
                <PortalIcon name="file" />
              </div>
              <div className="document-info">
                <h4>CAD Export - Master Plan.dwg</h4>
                <p>Uploaded Mar 15, 2024</p>
              </div>
              <div className="document-actions">
                <span className="document-type-badge">CAD File</span>
                <button className="document-download">
                  <PortalIcon name="download" />
                </button>
                <button className="document-more">⋮</button>
              </div>
            </div>
            <div className="document-row">
              <div className="document-icon">
                <PortalIcon name="file" />
              </div>
              <div className="document-info">
                <h4>Walnut Spec Sheet & Finish Samples</h4>
                <p>Uploaded Mar 15, 2024</p>
              </div>
              <div className="document-actions">
                <span className="document-type-badge">Spec Sheet</span>
                <button className="document-download">
                  <PortalIcon name="download" />
                </button>
                <button className="document-more">⋮</button>
              </div>
            </div>
            <div className="document-row">
              <div className="document-icon">
                <PortalIcon name="file" />
              </div>
              <div className="document-info">
                <h4>Main Unit Shop Drawings - Rev A</h4>
                <p>Uploaded Mar 15, 2024</p>
              </div>
              <div className="document-actions">
                <span className="document-type-badge">Approval</span>
                <button className="document-download">
                  <PortalIcon name="download" />
                </button>
                <button className="document-more">⋮</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Activity" && details && (
        <div className="detail-panel">
          <h3>
            Project Timeline{" "}
            <button
              className="manage-team-btn"
              style={{
                width: "auto",
                margin: 0,
                padding: "6px 16px",
                fontSize: "13px",
              }}
            >
              Add Update
            </button>
          </h3>
          <div className="timeline-list">
            {details.timeline.map((event, index) => (
              <div className="timeline-row" key={index}>
                <div className="timeline-icon">
                  <PortalIcon name="clock" />
                </div>
                <div className="timeline-content">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
                <div className="timeline-date">{event.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Payment" && (
        <div className="detail-panel">
          <h3>Payment Summary</h3>
          {paymentLoading ? (
            <p className="admin-empty-copy">Loading payment summary...</p>
          ) : (
            <>
              <section className="billing-metrics project-payment-metrics" aria-label="Project payment summary">
                <article className="billing-metric">
                  <div>
                    <span>Total paid</span>
                    <strong>{paymentSummary?.amountPaid || "$0.00"}</strong>
                  </div>
                  <span className="icon-tile icon-tile--danger">
                    <PortalIcon name="check" />
                  </span>
                </article>
                <article className="billing-metric">
                  <div>
                    <span>Amount due</span>
                    <strong>{paymentSummary?.amountDue || "$0.00"}</strong>
                  </div>
                  <span className="icon-tile icon-tile--danger">
                    <PortalIcon name="dollar" />
                  </span>
                </article>
              </section>

              <div className="payments-table project-payment-table">
                <div className="payments-table__head">
                  <span>PAYMENT DATE</span>
                  <span>METHOD</span>
                  <span>REFERENCE</span>
                  <span>AMOUNT</span>
                </div>
                {paymentSummary?.payments.length ? (
                  paymentSummary.payments.map((payment) => (
                    <article className="payments-table__row" key={payment.id}>
                      <span>{payment.date}</span>
                      <StatusBadge tone="neutral">{payment.method}</StatusBadge>
                      <span>{payment.reference}</span>
                      <strong>{payment.amount}</strong>
                    </article>
                  ))
                ) : (
                  <div className="admin-empty-row">No payments have been recorded for this project yet.</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
