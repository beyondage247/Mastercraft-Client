import { Modal, Pagination, Tabs } from "antd";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getCurrentPortalUser } from "../../auth/session";
import PageHeader from "../../components/PageHeader";
import { PortalIcon } from "../../components/PortalIcon";
import ProgressBar from "../../components/ProgressBar";
import StatusBadge from "../../components/StatusBadge";
import {
  currentWeekStart,
  formatReportDate,
  reportCompletionScore,
  reportGoalPercent,
  reportMetCustomerGoal,
  reportWeekLabel,
  weeklyReportGoals,
  type WeeklyReport,
} from "../../services/weeklyReportsStore";
import { createReport, getReports, type ReportRecord } from "../../services/portalApi";
import { showRequestToast } from "../../utils/portalToast";

type WeeklyReportFormState = {
  coldCalls: string;
  coffeeLunch: string;
  coldEmails: string;
  networkingEvents: string;
  newCustomers: string;
  notes: string;
  siteVisits: string;
  socialPosts: string;
  weekStart: string;
};

type GoalKey = "coldCalls" | "siteVisits" | "coldEmails" | "coffeeLunch" | "socialPosts" | "newCustomers";

const pageSize = 15;

const goalRows: Array<{ goal: number; key: GoalKey; label: string }> = [
  { key: "coldCalls", label: "Cold calls", goal: weeklyReportGoals.coldCalls },
  { key: "siteVisits", label: "Site / office visits", goal: weeklyReportGoals.siteVisits },
  { key: "coldEmails", label: "Cold emails", goal: weeklyReportGoals.coldEmails },
  { key: "coffeeLunch", label: "Coffee / lunch", goal: weeklyReportGoals.coffeeLunch },
  { key: "socialPosts", label: "Social media posts", goal: weeklyReportGoals.socialPosts },
  { key: "newCustomers", label: "New customers", goal: weeklyReportGoals.newCustomers },
];

function reportFormDefaults(report?: WeeklyReport): WeeklyReportFormState {
  return {
    coldCalls: String(report?.coldCalls ?? ""),
    coffeeLunch: String(report?.coffeeLunch ?? ""),
    coldEmails: String(report?.coldEmails ?? ""),
    networkingEvents: report?.networkingEvents ?? "",
    newCustomers: String(report?.newCustomers ?? ""),
    notes: report?.notes ?? "",
    siteVisits: String(report?.siteVisits ?? ""),
    socialPosts: String(report?.socialPosts ?? ""),
    weekStart: report?.weekStart ?? currentWeekStart(),
  };
}

function numberValue(value: string) {
  return Number(value) || 0;
}

function dateInputToReportDate(value: string) {
  const [year, month, day] = value.split("-");

  return year && month && day ? `${day}/${month}/${year}` : value;
}

function dateInputFromApi(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function addDaysInput(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function reportFromApi(report: ReportRecord): WeeklyReport {
  const weekStart = dateInputFromApi(report.startDate);

  return {
    coldCalls: Number(report.coldCalls) || 0,
    coffeeLunch: Number(report.coffeeLunch) || 0,
    coldEmails: Number(report.coldEmails) || 0,
    createdAt: report.createdAt,
    id: report.id,
    networkingEvents: report.networkingEvent || "",
    newCustomers: Number(report.newCustomers) || 0,
    notes: report.notes || "",
    siteVisits: Number(report.siteVisit) || 0,
    socialPosts: Number(report.socialMedia) || 0,
    staffEmail: report.user.email,
    staffId: report.user.id,
    staffName: report.user.name,
    updatedAt: report.updatedAt,
    weekEnd: dateInputFromApi(report.endDate) || addDaysInput(weekStart, 6),
    weekStart,
  };
}

function goalTone(value: number, goal: number) {
  return value >= goal ? "success" : "warning";
}

function WeeklyReportDetail({ report }: { report: WeeklyReport }) {
  return (
    <div className="weekly-report-detail">
      <div className="weekly-report-detail__hero">
        <div>
          <span>Weekly completion</span>
          <strong>{reportCompletionScore(report)}%</strong>
        </div>
        <ProgressBar value={reportCompletionScore(report)} />
      </div>

      <div className="admin-detail-grid">
        <div>
          <span>Staff</span>
          <strong>{report.staffName}</strong>
        </div>
        <div>
          <span>Week</span>
          <strong>{reportWeekLabel(report)}</strong>
        </div>
        <div>
          <span>New customers</span>
          <strong>{report.newCustomers} / {weeklyReportGoals.newCustomers}</strong>
        </div>
        <div>
          <span>Submitted</span>
          <strong>{formatReportDate(report.updatedAt.slice(0, 10))}</strong>
        </div>
      </div>

      <div className="weekly-report-goal-list">
        {goalRows.map((goal) => {
          const value = report[goal.key];

          return (
            <article key={goal.key}>
              <div>
                <strong>{goal.label}</strong>
                <span>{value} of {goal.goal}</span>
              </div>
              <div>
                <ProgressBar value={reportGoalPercent(value, goal.goal)} />
                <StatusBadge tone={goalTone(value, goal.goal)}>
                  {value >= goal.goal ? "Met" : "Below"}
                </StatusBadge>
              </div>
            </article>
          );
        })}
      </div>

      <div className="admin-project-detail__notes">
        <span>Networking events</span>
        <p>{report.networkingEvents || "No networking events recorded."}</p>
      </div>
      <div className="admin-project-detail__notes">
        <span>Notes</span>
        <p>{report.notes || "No notes added."}</p>
      </div>
    </div>
  );
}

function AdminWeeklyReports() {
  const currentUser = getCurrentPortalUser();
  const isAdmin = currentUser?.role === "admin";
  const staffId = currentUser?.clientItemId || currentUser?.email || "staff";
  const [allReports, setAllReports] = useState<WeeklyReport[]>([]);
  const [form, setForm] = useState<WeeklyReportFormState>(() => reportFormDefaults());
  const [page, setPage] = useState(1);
  const [reportSearch, setReportSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    let isMounted = true;

    getReports()
      .then((reports) => {
        if (isMounted) {
          setAllReports(reports.map(reportFromApi));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllReports([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const ownReports = useMemo(
    () => allReports.filter((report) => report.staffId === staffId),
    [allReports, staffId],
  );
  const adminReports = useMemo(() => allReports, [allReports]);
  const displayedReports = useMemo(() => {
    const source = isAdmin ? adminReports : ownReports;
    const normalizedSearch = reportSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return source;
    }

    return source.filter((report) =>
      [
        report.staffName,
        report.staffEmail,
        report.weekStart,
        report.weekEnd,
        report.networkingEvents,
        report.notes,
        report.newCustomers,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [adminReports, isAdmin, ownReports, reportSearch]);

  useEffect(() => {
    setPage(1);
  }, [displayedReports.length, reportSearch]);

  const paginatedReports = useMemo(
    () => displayedReports.slice((page - 1) * pageSize, page * pageSize),
    [displayedReports, page],
  );

  const latestWeek = adminReports[0]?.weekStart || currentWeekStart();
  const latestWeekReports = adminReports.filter((report) => report.weekStart === latestWeek);
  const averageScore = latestWeekReports.length
    ? Math.round(
        latestWeekReports.reduce((sum, report) => sum + reportCompletionScore(report), 0) /
          latestWeekReports.length,
      )
    : 0;

  function updateField(field: keyof WeeklyReportFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleWeekChange(value: string) {
    const existing = allReports.find((report) => report.staffId === staffId && report.weekStart === value);

    setForm({
      ...reportFormDefaults(existing ?? undefined),
      weekStart: value,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    if (!form.weekStart) {
      return;
    }

    const toast = showRequestToast("weekly-report", "Saving weekly report...");

    try {
      const report = await createReport({
        coldCalls: String(numberValue(form.coldCalls)),
        coffeeLunch: String(numberValue(form.coffeeLunch)),
        coldEmails: String(numberValue(form.coldEmails)),
        endDate: dateInputToReportDate(addDaysInput(form.weekStart, 6)),
        networkingEvent: form.networkingEvents.trim(),
        newCustomers: String(numberValue(form.newCustomers)),
        notes: form.notes.trim(),
        siteVisit: String(numberValue(form.siteVisits)),
        socialMedia: String(numberValue(form.socialPosts)),
        startDate: dateInputToReportDate(form.weekStart),
      });
      const mappedReport = reportFromApi(report);

      setAllReports((current) => [
        mappedReport,
        ...current.filter((item) => item.id !== mappedReport.id),
      ]);
      setForm(reportFormDefaults(mappedReport));
      toast.success("Weekly report saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save weekly report.");
    }
  }

  return (
    <div className="page-stack admin-page">
      <PageHeader
        subtitle={isAdmin ? "Review staff outreach activity and weekly customer targets" : "Submit your weekly outreach activity"}
        title="Weekly Reports"
      />

      {isAdmin ? (
        <section className="weekly-report-summary-grid">
          <article className="panel weekly-report-metric">
            <span>Current week reports</span>
            <strong>{latestWeekReports.length}</strong>
            <small>{formatReportDate(latestWeek)} week</small>
          </article>
          <article className="panel weekly-report-metric">
            <span>Average completion</span>
            <strong>{averageScore}%</strong>
            <ProgressBar value={averageScore} />
          </article>
          <article className="panel weekly-report-metric">
            <span>Customer target met</span>
            <strong>{latestWeekReports.filter(reportMetCustomerGoal).length}</strong>
            <small>2 new customers minimum</small>
          </article>
        </section>
      ) : null}

      <Tabs
        items={[
          ...(!isAdmin
            ? [
                {
                  key: "submit",
                  label: "Submit report",
                  children: (
                    <form className="panel weekly-report-form" onSubmit={handleSubmit}>
                      <div className="panel__header">
                        <h2>Weekly Activity</h2>
                        <StatusBadge tone="info">Staff</StatusBadge>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="reportWeekStart">Week start</label>
                          <input
                            id="reportWeekStart"
                            onChange={(event) => handleWeekChange(event.target.value)}
                            type="date"
                            value={form.weekStart}
                          />
                        </div>
                        <div className="weekly-target-callout">
                          <strong>Minimum target</strong>
                          <span>Bring in two new customers per week.</span>
                        </div>
                      </div>

                      <div className="weekly-report-input-grid">
                        {goalRows.map((goal) => (
                          <div className="form-group" key={goal.key}>
                            <label htmlFor={goal.key}>{goal.label}</label>
                            <input
                              id={goal.key}
                              min="0"
                              onChange={(event) => updateField(goal.key, event.target.value)}
                              placeholder={`Goal ${goal.goal}`}
                              type="number"
                              value={form[goal.key]}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="form-group">
                        <label htmlFor="networkingEvents">Networking events</label>
                        <textarea
                          id="networkingEvents"
                          onChange={(event) => updateField("networkingEvents", event.target.value)}
                          placeholder="Scheduled events attended or planned: BIA, ABC, Chamber, etc."
                          rows={3}
                          value={form.networkingEvents}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="weeklyNotes">Notes</label>
                        <textarea
                          id="weeklyNotes"
                          onChange={(event) => updateField("notes", event.target.value)}
                          placeholder="Wins, blockers, follow-ups, or pipeline notes"
                          rows={4}
                          value={form.notes}
                        />
                      </div>

                      <div className="admin-form-actions">
                        <button className="primary-action" type="submit">
                          <PortalIcon name="plus" />
                          <span>Submit Weekly Report</span>
                        </button>
                      </div>
                    </form>
                  ),
                },
              ]
            : []),
          {
            key: "reports",
            label: isAdmin ? "Staff reports" : "My reports",
            children: (
              <section className="panel admin-client-list">
                <div className="panel__header">
                  <h2>{isAdmin ? "Submitted Reports" : "Report History"}</h2>
                  <span>{displayedReports.length} showing</span>
                </div>
                <label className="admin-table-search">
                  <PortalIcon name="search" />
                  <input
                    aria-label="Search reports"
                    onChange={(event) => setReportSearch(event.target.value)}
                    placeholder="Search reports"
                    type="search"
                    value={reportSearch}
                  />
                </label>
                <div className="weekly-report-table">
                  <div className="weekly-report-table__head">
                    <span>Staff</span>
                    <span>Week</span>
                    <span>Outreach score</span>
                    <span>New customers</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  {displayedReports.length ? (
                    paginatedReports.map((report) => (
                      <article className="weekly-report-table__row" key={report.id}>
                        <strong>{report.staffName}</strong>
                        <span>{reportWeekLabel(report)}</span>
                        <span className="admin-project-progress-cell">
                          <strong>{reportCompletionScore(report)}%</strong>
                          <ProgressBar value={reportCompletionScore(report)} />
                        </span>
                        <span>{report.newCustomers} / {weeklyReportGoals.newCustomers}</span>
                        <StatusBadge tone={reportMetCustomerGoal(report) ? "success" : "warning"}>
                          {reportMetCustomerGoal(report) ? "Target met" : "Needs follow-up"}
                        </StatusBadge>
                        <span>
                          <button
                            className="table-action-button"
                            onClick={() => setSelectedReport(report)}
                            type="button"
                          >
                            View
                          </button>
                        </span>
                      </article>
                    ))
                  ) : (
                    <div className="admin-empty-row">
                      {isAdmin ? "No staff weekly reports have been submitted yet." : "You have not submitted a weekly report yet."}
                    </div>
                  )}
                </div>
                <Pagination
                  className="admin-client-pagination"
                  current={page}
                  onChange={setPage}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  total={displayedReports.length}
                />
              </section>
            ),
          },
        ]}
      />

      <Modal
        footer={null}
        onCancel={() => setSelectedReport(null)}
        open={Boolean(selectedReport)}
        title={selectedReport ? `${selectedReport.staffName} report` : "Weekly report"}
        width={920}
      >
        {selectedReport ? <WeeklyReportDetail report={selectedReport} /> : null}
      </Modal>
    </div>
  );
}

export default AdminWeeklyReports;
