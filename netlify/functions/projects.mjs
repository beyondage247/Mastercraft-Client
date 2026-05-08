import {
  columnIds,
  columnMap,
  columnText,
  getBoardItems,
  handleError,
  json,
  numberFromColumn,
  requiredEnv,
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
    const boardId = requiredEnv('MONDAY_PROJECTS_BOARD_ID');
    const ids = columnIds('MONDAY_PROJECT', {
      STATUS: 'status',
      CATEGORY: 'category',
      LOCATION: 'location',
      DUE_DATE: 'due_date',
      PROGRESS: 'progress',
    });
    const projects = (await getBoardItems(boardId)).map((item) => mapProject(item, ids));
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
