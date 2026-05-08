const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_VERSION = process.env.MONDAY_API_VERSION || '2026-04';

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function columnIds(prefix, defaults) {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [
      key,
      process.env[`${prefix}_${key.toUpperCase()}_COLUMN`] || fallback,
    ]),
  );
}

export function columnMap(item) {
  return Object.fromEntries(item.column_values.map((column) => [column.id, column]));
}

export function columnText(columns, id, fallback = '') {
  return columns[id]?.text || fallback;
}

export function numberFromColumn(columns, id, fallback = 0) {
  const raw = columnText(columns, id, `${fallback}`);
  const match = raw.match(/\d+(\.\d+)?/);

  return match ? Number(match[0]) : fallback;
}

export async function mondayRequest(query, variables = {}) {
  const token = requiredEnv('MONDAY_API_TOKEN');
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: token,
      'API-Version': MONDAY_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    const detail = payload.errors?.[0]?.message || response.statusText;
    throw new Error(`monday.com API request failed: ${detail}`);
  }

  return payload.data;
}

export async function getBoardItems(boardId) {
  const query = `
    query GetBoardItems($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 100) {
          items {
            id
            name
            column_values {
              id
              text
              type
              value
            }
          }
        }
      }
    }
  `;

  const data = await mondayRequest(query, { boardId: [boardId] });

  return data.boards?.[0]?.items_page?.items || [];
}

export async function changeColumnValue({ boardId, columnId, itemId, value }) {
  const mutation = `
    mutation ChangeColumnValue($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
        id
      }
    }
  `;

  return mondayRequest(mutation, {
    boardId,
    columnId,
    itemId,
    value: JSON.stringify(value),
  });
}

export function handleError(error) {
  console.error(error);

  return json(500, {
    error: 'Unable to load monday.com data.',
    message: error instanceof Error ? error.message : 'Unknown server error',
  });
}
