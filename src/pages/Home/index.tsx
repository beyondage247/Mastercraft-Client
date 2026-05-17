import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PortalIcon } from "../../components/PortalIcon";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { getCurrentPortalUser } from "../../auth/session";
import { activeProjects, homeMetrics, recentActivity } from "../../data/portal";
import type { DashboardResponse } from "../../services/portalApi";
import { getDashboard } from "../../services/portalApi";

function Home() {
  const name = getCurrentPortalUser()?.name || "Valued Client";
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

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Welcome, {name}</h1>
        <p>
          Welcome to the Mastercraft Products client portal. Track your
          fabrication projects, review quotes, and manage approvals all in one
          place.
        </p>
        <div className="hero-panel__actions">
          {/* <Link className="portal-button portal-button--light" to="/new">
            <PortalIcon name="plus" />
            <span>New Project Request</span>
          </Link> */}
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
          <section className="panel">
            {/* <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link className="quick-action quick-action--primary" to="/new">
                <PortalIcon name="plus" />
                <span>Submit Project Request</span>
              </Link>
              <Link className="quick-action" to="/quotes">
                <PortalIcon name="plus" />
                <span>Review Quote Request</span>
              </Link>
            </div> */}
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
