import {
  columnMap,
  columnText,
  getBoardItems,
  handleError,
  inferredColumnIds,
  json,
  numberFromColumn,
  resolveBoard,
} from './_monday.mjs';

const statusTone = {
  Completed: 'success',
  'In Design': 'info',
  'In Fabrication': 'danger',
  Pending: 'danger',
};

function normalizeProjectStatus(status) {
  if (status === 'Completed' || status === 'In Design' || status === 'In Fabrication' || status === 'Pending') {
    return status;
  }

  return 'Pending';
}

function mapProject(item, ids) {
  const columns = columnMap(item);
  const status = normalizeProjectStatus(columnText(columns, ids.STATUS, 'Pending'));

  return {
    category: columnText(columns, ids.CATEGORY, 'Commercial'),
    dueDate: columnText(columns, ids.DUE_DATE, ''),
    location: columnText(columns, ids.LOCATION, ''),
    progress: numberFromColumn(columns, ids.PROGRESS, 0),
    status,
    title: item.name,
  };
}

function buildMetrics(projects) {
  const inProgressCount = projects.filter((project) =>
    ['In Design', 'In Fabrication'].includes(project.status),
  ).length;

  return [
    { icon: 'projects', label: 'Team Projects', tone: 'danger', value: `${projects.length}` },
    { icon: 'projects', label: 'In Progress', tone: 'danger', value: `${inProgressCount}` },
    {
      icon: 'projects',
      label: 'Pending Start',
      tone: 'danger',
      value: `${projects.filter((project) => project.status === 'Pending').length}`,
    },
    {
      icon: 'projects',
      label: 'Completed',
      tone: 'danger',
      value: `${projects.filter((project) => project.status === 'Completed').length}`,
    },
  ];
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const board = await resolveBoard({
      candidates: ['customer projects', 'production tracker board', 'production tracker', 'projects', 'deals orders board'],
      envName: 'MONDAY_PROJECTS_BOARD_ID',
      label: 'Projects',
    });
    const ids = inferredColumnIds('MONDAY_PROJECT', board, {
      STATUS: { candidates: ['project status', 'production status', 'deal status', 'status'], fallback: 'status', types: ['status'] },
      CATEGORY: { candidates: ['project type', 'deal type', 'category', 'type'], fallback: 'category', types: ['dropdown', 'status'] },
      LOCATION: { candidates: ['project location', 'location', 'address', 'site'], fallback: 'location', types: ['location', 'text'] },
      DUE_DATE: { candidates: ['delivery date', 'expected close date', 'due date', 'deadline', 'date'], fallback: 'due_date', types: ['date'] },
      PROGRESS: { candidates: ['progress', 'close probability', 'percentage', 'completion'], fallback: 'progress', types: ['numbers'] },
    });
    const projects = (await getBoardItems(board.id)).map((item) => mapProject(item, ids));
    const activeProjects = projects.slice(0, 3).map((project) => ({
      category: project.category,
      estimate: project.dueDate ? `Est: ${project.dueDate}` : 'Est: Pending',
      location: project.location,
      name: project.title,
      status: project.status,
      tone: statusTone[project.status] || 'neutral',
    }));

    return json(200, {
      activeProjects,
      metrics: buildMetrics(projects),
      projects,
    });
  } catch (error) {
    return handleError(error);
  }
}
