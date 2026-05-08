import { handler as projectsHandler } from './projects.mjs';
import { handler as quotesHandler } from './quotes.mjs';
import { json } from './_monday.mjs';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const [projectResponse, quoteResponse] = await Promise.all([
    projectsHandler({ ...event, httpMethod: 'GET' }),
    quotesHandler({ ...event, httpMethod: 'GET' }),
  ]);

  if (projectResponse.statusCode >= 400 || quoteResponse.statusCode >= 400) {
    return json(500, {
      error: 'Unable to load dashboard data from monday.com.',
      projects: JSON.parse(projectResponse.body),
      quotes: JSON.parse(quoteResponse.body),
    });
  }

  const projectData = JSON.parse(projectResponse.body);
  const quoteData = JSON.parse(quoteResponse.body);
  const unreadMessages = process.env.MONDAY_UNREAD_MESSAGES_COUNT || '0';

  return json(200, {
    activeProjects: projectData.activeProjects,
    homeMetrics: [
      {
        icon: 'activeProjects',
        label: 'Active Projects',
        pill: { label: 'Active', tone: 'danger' },
        tone: 'danger',
        value: `${projectData.activeProjects.length}`,
      },
      {
        icon: 'file',
        label: 'Pending Quotes',
        pill: { label: 'Review', tone: 'neutral' },
        tone: 'neutral',
        value: quoteData.metrics.find((metric) => metric.label === 'Pending')?.value || '0',
      },
      {
        icon: 'messages',
        label: 'Unread Messages',
        pill: { label: 'New', tone: 'info' },
        tone: 'info',
        value: unreadMessages,
      },
    ],
    projectMetrics: projectData.metrics,
    quoteMetrics: quoteData.metrics,
    recentActivity: [],
  });
}
