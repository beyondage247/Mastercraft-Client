import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PortalIcon } from "../../components/PortalIcon";
import StatusBadge from "../../components/StatusBadge";
import { getProjectDetail } from "../../services/portalApi";
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
    "Overview" | "Document" | "Activity"
  >("Overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProjectDetail(id).then((data) => {
        if (data.project) setProject(data.project);
        if (data.details) setDetails(data.details);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="page-stack">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="page-stack">
        <button className="back-link" onClick={() => navigate("/projects")}>
          <PortalIcon name="left" /> Back to Projects
        </button>
        <div className="panel">Project not found</div>
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
                  <span className="quote-status">Accepted</span>
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
    </div>
  );
}

export default ProjectDetail;
