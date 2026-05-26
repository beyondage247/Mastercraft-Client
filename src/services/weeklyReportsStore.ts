export type WeeklyReportInput = {
  coldCalls: number;
  coffeeLunch: number;
  coldEmails: number;
  networkingEvents: string;
  newCustomers: number;
  notes: string;
  siteVisits: number;
  socialPosts: number;
  staffEmail: string;
  staffId: string;
  staffName: string;
  weekStart: string;
};

export type WeeklyReport = WeeklyReportInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  weekEnd: string;
};

export const weeklyReportGoals = {
  coldCalls: 25,
  coffeeLunch: 5,
  coldEmails: 25,
  newCustomers: 2,
  siteVisits: 10,
  socialPosts: 3,
};

const reportsKey = "mastercraft_weekly_reports";

function readReports() {
  const raw = window.localStorage.getItem(reportsKey);

  if (!raw) {
    return [] as WeeklyReport[];
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as WeeklyReport[]) : [];
  } catch {
    return [];
  }
}

function writeReports(reports: WeeklyReport[]) {
  window.localStorage.setItem(reportsKey, JSON.stringify(reports));
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

export function currentWeekStart() {
  const date = new Date();
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + mondayOffset);

  return date.toISOString().slice(0, 10);
}

export function formatReportDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function reportWeekLabel(report: Pick<WeeklyReport, "weekEnd" | "weekStart">) {
  return `${formatReportDate(report.weekStart)} - ${formatReportDate(report.weekEnd)}`;
}

export function reportGoalPercent(value: number, goal: number) {
  if (goal <= 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, Math.round((value / goal) * 100)));
}

export function reportCompletionScore(report: WeeklyReport) {
  const goals = [
    reportGoalPercent(report.coldCalls, weeklyReportGoals.coldCalls),
    reportGoalPercent(report.siteVisits, weeklyReportGoals.siteVisits),
    reportGoalPercent(report.coldEmails, weeklyReportGoals.coldEmails),
    reportGoalPercent(report.coffeeLunch, weeklyReportGoals.coffeeLunch),
    reportGoalPercent(report.socialPosts, weeklyReportGoals.socialPosts),
    reportGoalPercent(report.newCustomers, weeklyReportGoals.newCustomers),
  ];

  return Math.round(goals.reduce((sum, value) => sum + value, 0) / goals.length);
}

export function reportMetCustomerGoal(report: WeeklyReport) {
  return report.newCustomers >= weeklyReportGoals.newCustomers;
}

export function listWeeklyReports() {
  return readReports().sort((left, right) => {
    const weekCompare = right.weekStart.localeCompare(left.weekStart);

    return weekCompare || right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function listWeeklyReportsForStaff(staffId: string) {
  return listWeeklyReports().filter((report) => report.staffId === staffId);
}

export function findWeeklyReport(staffId: string, weekStart: string) {
  return readReports().find((report) => report.staffId === staffId && report.weekStart === weekStart);
}

export function saveWeeklyReport(input: WeeklyReportInput) {
  const reports = readReports();
  const existing = reports.find(
    (report) => report.staffId === input.staffId && report.weekStart === input.weekStart,
  );
  const now = new Date().toISOString();
  const report: WeeklyReport = {
    ...input,
    createdAt: existing?.createdAt || now,
    id: existing?.id || `weekly-report-${crypto.randomUUID()}`,
    updatedAt: now,
    weekEnd: addDays(input.weekStart, 4),
  };
  const nextReports = [
    report,
    ...reports.filter((item) => item.id !== report.id),
  ];

  writeReports(nextReports);

  return report;
}
