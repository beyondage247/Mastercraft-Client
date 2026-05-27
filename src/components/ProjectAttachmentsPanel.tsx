import { type FormEvent, useEffect, useState } from "react";
import type { ProjectListItem, ProjectUploadItem } from "../data/portal";
import {
  attachProjectUploads,
  uploadDownloadUrl,
  uploadFile,
} from "../services/portalApi";
import { showRequestToast } from "../utils/portalToast";
import { PortalIcon } from "./PortalIcon";

type ProjectAttachmentsPanelProps = {
  canUpload?: boolean;
  onProjectUpdated?: (project: ProjectListItem) => void;
  project: ProjectListItem;
};

function fileSizeText(size: number) {
  if (!size) {
    return "";
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ProjectAttachmentsPanel({ canUpload = false, onProjectUpdated, project }: ProjectAttachmentsPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<ProjectUploadItem[]>(project.attachment?.uploads ?? []);

  useEffect(() => {
    setUploads(project.attachment?.uploads ?? []);
  }, [project]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      showRequestToast("project-upload-validation", "Checking file...").error("Select a file to upload.");
      return;
    }

    const toast = showRequestToast("project-upload", "Uploading document...");
    setIsUploading(true);

    try {
      const uploadId = await uploadFile(file);
      const updatedProject = await attachProjectUploads(project.id, [
        ...uploads.map((upload) => upload.id),
        uploadId,
      ]);

      setUploads(updatedProject.attachment?.uploads ?? []);
      onProjectUpdated?.(updatedProject);
      setFile(null);
      toast.success("Document attached to project.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload document.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="project-attachments-panel">
      {canUpload ? (
        <form className="project-upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor={`projectUpload-${project.id}`}>Upload document</label>
            <input
              id={`projectUpload-${project.id}`}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </div>
          <button className="primary-action" disabled={isUploading} type="submit">
            <PortalIcon name="upload" />
            <span>{isUploading ? "Uploading..." : "Upload"}</span>
          </button>
        </form>
      ) : null}

      <div className="project-upload-list">
        {uploads.length ? (
          uploads.map((upload) => (
            <article className="project-upload-row" key={upload.id}>
              <div>
                <strong>{upload.name}</strong>
                <span>{fileSizeText(upload.size)}</span>
              </div>
              <a className="table-action-button" href={uploadDownloadUrl(upload.id)} rel="noreferrer" target="_blank">
                <PortalIcon name="download" />
                <span>Download</span>
              </a>
            </article>
          ))
        ) : (
          <div className="admin-empty-row">No documents have been attached to this project yet.</div>
        )}
      </div>
    </div>
  );
}

export default ProjectAttachmentsPanel;
