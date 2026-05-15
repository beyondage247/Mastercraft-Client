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

function normalize(value) {
  return `${value || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchesAny(value, candidates) {
  const normalizedValue = normalize(value);

  return candidates.some((candidate) => {
    const normalizedCandidate = normalize(candidate);

    return normalizedValue === normalizedCandidate || normalizedValue.includes(normalizedCandidate);
  });
}

export async function discoverBoards() {
  const query = `
    query DiscoverBoards {
      boards(limit: 100) {
        id
        name
        state
        type
        workspace {
          id
          name
        }
        columns {
          id
          title
          type
        }
      }
    }
  `;

  const data = await mondayRequest(query);

  return data.boards || [];
}

export async function resolveBoard({ candidates, envName, label }) {
  const configuredBoardId = process.env[envName];
  const boards = await discoverBoards();

  if (configuredBoardId) {
    const configuredBoard = boards.find((board) => board.id === configuredBoardId);

    if (configuredBoard) {
      return configuredBoard;
    }

    return { id: configuredBoardId, name: label, columns: [] };
  }

  const activeBoards = boards.filter((board) => {
    const name = normalize(board.name);

    return board.state !== 'deleted' && !name.startsWith('subitems of') && !name.startsWith('duplicate of');
  });
  const scoredBoards = activeBoards
    .map((candidateBoard) => {
      const normalizedName = normalize(candidateBoard.name);
      const score = candidates.reduce((bestScore, candidate, index) => {
        const normalizedCandidate = normalize(candidate);

        if (normalizedName === normalizedCandidate) {
          return Math.max(bestScore, 1000 - index);
        }

        if (normalizedName.includes(normalizedCandidate)) {
          return Math.max(bestScore, 500 - index);
        }

        return bestScore;
      }, 0);

      return { board: candidateBoard, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
  const board = scoredBoards[0]?.board;

  if (!board) {
    throw new Error(`Could not infer the ${label} board. Set ${envName} in your environment variables.`);
  }

  return board;
}

export function inferColumnId({ board, candidates, envName, fallback, types = [] }) {
  const configuredColumnId = process.env[envName];

  if (configuredColumnId) {
    return configuredColumnId;
  }

  const columns = board.columns || [];
  const exactMatch = candidates
    .map((candidate) =>
      columns.find((column) => normalize(column.title) === normalize(candidate) || normalize(column.id) === normalize(candidate)),
    )
    .find(Boolean);

  if (exactMatch) {
    return exactMatch.id;
  }

  const titleMatch = candidates
    .map((candidate) => columns.find((column) => matchesAny(column.title, [candidate]) || matchesAny(column.id, [candidate])))
    .find(Boolean);

  if (titleMatch) {
    return titleMatch.id;
  }

  const typeMatch = columns.find((column) => types.includes(column.type));

  return typeMatch?.id || fallback;
}

export function inferredColumnIds(prefix, board, defaults) {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, config]) => [
      key,
      inferColumnId({
        board,
        envName: `${prefix}_${key}_COLUMN`,
        ...config,
      }),
    ]),
  );
}

export function columnMap(item) {
  return Object.fromEntries(item.column_values.map((column) => [column.id, column]));
}

export function columnText(columns, id, fallback = '') {
  return columns[id]?.text || fallback;
}

export function columnValue(columns, id, fallback = '') {
  return columns[id]?.value || fallback;
}

export function itemMatchesClient(item, columnId, client) {
  if (!client || client.role !== 'client' || !columnId) {
    return true;
  }

  const columns = columnMap(item);
  const column = columns[columnId];
  const haystack = [column?.text, column?.value, item.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const needles = [client.clientItemId, client.email, client.name]
    .filter(Boolean)
    .map((value) => `${value}`.toLowerCase());

  return needles.some((needle) => haystack.includes(needle));
}

export function filterItemsForClient(items, columnId, client) {
  if (client?.role !== 'client') {
    return items;
  }

  if (!columnId) {
    return [];
  }

  return items.filter((item) => itemMatchesClient(item, columnId, client));
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

export async function createItem({ boardId, itemName, columnValues = {} }) {
  const mutation = `
    mutation CreateItem($boardId: ID!, $itemName: String!, $columnValues: JSON) {
      create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
        name
      }
    }
  `;

  return mondayRequest(mutation, {
    boardId,
    itemName,
    columnValues: JSON.stringify(columnValues),
  });
}

export function handleError(error) {
  console.error(error);

  return json(500, {
    error: 'Unable to load monday.com data.',
    message: error instanceof Error ? error.message : 'Unknown server error',
  });
}
