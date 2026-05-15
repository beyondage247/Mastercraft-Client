import {
  columnMap,
  columnText,
  getBoardItems,
  handleError,
  inferredColumnIds,
  filterItemsForClient,
  json,
  resolveBoard,
} from './_monday.mjs';

function normalizeType(type) {
  if (['Shop drawing', 'CAD File', 'Spec Sheet', 'Photo'].includes(type)) {
    return type;
  }

  const normalizedType = type.toLowerCase();

  if (normalizedType.includes('photo') || normalizedType.includes('image')) return 'Photo';
  if (normalizedType.includes('cad') || normalizedType.includes('dwg')) return 'CAD File';
  if (normalizedType.includes('spec')) return 'Spec Sheet';
  if (normalizedType.includes('shop')) return 'Shop drawing';

  return 'Spec Sheet';
}

function mapDocument(item, ids) {
  const columns = columnMap(item);

  return {
    date: columnText(columns, ids.DATE, ''),
    id: item.id,
    project: columnText(columns, ids.PROJECT, ''),
    title: item.name,
    type: normalizeType(columnText(columns, ids.TYPE, 'Spec Sheet')),
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
    const board = await resolveBoard({
      candidates: ['quotes invoices board', 'quotes invoices', 'employee onboarding guide', 'documents', 'document', 'files', 'drawings', 'specifications'],
      envName: 'MONDAY_DOCUMENTS_BOARD_ID',
      label: 'Documents',
    });
    const ids = inferredColumnIds('MONDAY_DOCUMENT', board, {
      TYPE: { candidates: ['type', 'document type', 'file type', 'status'], fallback: 'type', types: ['status', 'dropdown'] },
      PROJECT: { candidates: ['deals orders', 'project', 'job', 'site', 'client'], fallback: 'project', types: ['text', 'board_relation'] },
      DATE: { candidates: ['issue date', 'date', 'uploaded', 'created'], fallback: 'date', types: ['date'] },
      CLIENT: { candidates: ['client board', 'client', 'customer', 'company'], fallback: process.env.MONDAY_DOCUMENT_CLIENT_COLUMN || '', types: ['board_relation'] },
    });
    const items = filterItemsForClient(await getBoardItems(board.id), ids.CLIENT, event.portalUser);
    const documents = items.map((item) => mapDocument(item, ids));

    return json(200, { documents });
  } catch (error) {
    return handleError(error);
  }
}
