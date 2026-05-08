import { handleError, json, mondayRequest } from './_monday.mjs';

function compactBoard(board) {
  return {
    id: board.id,
    name: board.name,
    state: board.state,
    type: board.type,
    workspace: board.workspace
      ? {
          id: board.workspace.id,
          name: board.workspace.name,
        }
      : null,
    columns: board.columns.map((column) => ({
      id: column.id,
      title: column.title,
      type: column.type,
    })),
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, {});
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
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
    const boards = (data.boards || []).map(compactBoard);

    return json(200, {
      boards,
      instructions: {
        projectsBoardId: 'Pick the board that contains your project/fabrication work and copy its id.',
        quotesBoardId: 'Pick the board that contains estimates/quotes and copy its id.',
        columnIds: 'Use each column id, not the title, in your Netlify environment variables.',
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
