export const DOCUMENT_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
export const DOCUMENT_UPLOAD_MAX_MB = DOCUMENT_UPLOAD_MAX_BYTES / (1024 * 1024);

export function documentUploadLimitText() {
  return `${DOCUMENT_UPLOAD_MAX_MB}MB`;
}

export function isWithinDocumentUploadLimit(file: File) {
  return file.size <= DOCUMENT_UPLOAD_MAX_BYTES;
}
