import { type FormEvent, useEffect, useState } from "react";
import type { ProjectListItem, DocumentCategoryItem, ProjectDocumentItem } from "../data/portal";
import {
  addProjectDocument,
  createDocumentCategory,
  deleteDocumentCategory,
  deleteProjectDocument,
  getProjectDocumentsCategories,
  updateDocumentCategory,
  uploadDownloadUrl,
  uploadFile,
} from "../services/portalApi";
import { documentUploadLimitText, isWithinDocumentUploadLimit } from "../utils/uploadLimits";
import { showRequestToast } from "../utils/portalToast";
import { PortalIcon } from "./PortalIcon";
import { Modal, Input, Button } from "antd";

type ProjectAttachmentsPanelProps = {
  canUpload?: boolean;
  onProjectUpdated?: (project: ProjectListItem) => void;
  project: ProjectListItem;
};

function fileSizeText(size?: number) {
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
  const [categories, setCategories] = useState<DocumentCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Modals state
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [renameCategoryTarget, setRenameCategoryTarget] = useState<DocumentCategoryItem | null>(null);
  const [renameCategoryName, setRenameCategoryName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectDocumentsCategories(project.id);
      let parsedCategories = [];
      if (Array.isArray(data)) {
        parsedCategories = data;
      } else if (data && typeof data === "object") {
        parsedCategories = (data as any).categories || (data as any).data || (data as any).documents || [];
      }
      setCategories(Array.isArray(parsedCategories) ? parsedCategories : []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [project.id]);

  const activeCategory = activeCategoryId ? categories.find((c) => c.id === activeCategoryId) : null;
  const rootDocuments = categories.find((c) => c.id === "uncategorized")?.documents || [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      showRequestToast("project-upload-validation", "Checking file...").error("Select a file to upload.");
      return;
    }

    if (!isWithinDocumentUploadLimit(file)) {
      showRequestToast("project-upload-validation", "Checking file...").error(
        `Documents can be up to ${documentUploadLimitText()} each.`,
      );
      return;
    }

    const toast = showRequestToast("project-upload", "Uploading document...");
    setIsUploading(true);

    try {
      const uploadId = await uploadFile(file);
      await addProjectDocument(project.id, uploadId, activeCategoryId || undefined);
      
      await fetchCategories();
      
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById(`projectUpload-${project.id}`) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      toast.success("Document attached to project.");
      if (onProjectUpdated) {
        onProjectUpdated({ ...project }); // Trigger re-render if needed
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload document.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      await createDocumentCategory(project.id, newCategoryName.trim());
      await fetchCategories();
      setIsCreateVisible(false);
      setNewCategoryName("");
    } catch (error) {
      showRequestToast("project-category", "Creating category...").error("Failed to create category");
    } finally {
      setIsCreating(false);
    }
  }

  function openRenameModal(category: DocumentCategoryItem) {
    setRenameCategoryTarget(category);
    setRenameCategoryName(category.name);
  }

  async function handleRenameCategory() {
    if (!renameCategoryTarget || !renameCategoryName.trim() || renameCategoryName === renameCategoryTarget.name) {
      setRenameCategoryTarget(null);
      return;
    }

    setIsRenaming(true);
    try {
      await updateDocumentCategory(renameCategoryTarget.id, renameCategoryName.trim());
      await fetchCategories();
      setRenameCategoryTarget(null);
    } catch (error) {
      showRequestToast("project-category", "Renaming category...").error("Failed to rename category");
    } finally {
      setIsRenaming(false);
    }
  }

  function handleDeleteCategory(category: DocumentCategoryItem) {
    Modal.confirm({
      title: "Delete Category",
      content: `Are you sure you want to delete the category "${category.name}"? Documents will be moved to uncategorized.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDocumentCategory(category.id);
          if (activeCategoryId === category.id) setActiveCategoryId(null);
          await fetchCategories();
        } catch (error) {
          showRequestToast("project-category", "Deleting category...").error("Failed to delete category");
        }
      },
    });
  }

  function handleDeleteDocument(documentItem: ProjectDocumentItem) {
    Modal.confirm({
      title: "Delete Document",
      content: `Are you sure you want to delete the document "${documentItem.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteProjectDocument(documentItem.id);
          await fetchCategories();
        } catch (error) {
          showRequestToast("project-document", "Deleting document...").error("Failed to delete document");
        }
      },
    });
  }



  if (isLoading) {
    return <div className="admin-empty-row">Loading documents...</div>;
  }

  return (
    <div className="project-attachments-panel">
      {canUpload && activeCategory ? (
        <div className="project-attachments-header" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <form className="project-upload-form" onSubmit={handleSubmit} style={{ flex: 1, minWidth: '300px' }}>
            <div className="form-group">
              <label htmlFor={`projectUpload-${project.id}`}>
                Upload to {activeCategory.name}
              </label>
              <input
                id={`projectUpload-${project.id}`}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                type="file"
              />
              <p className="upload-hint">Max {documentUploadLimitText()} per document.</p>
            </div>
            <button className="primary-action" disabled={isUploading} type="submit">
              <PortalIcon name="upload" />
              <span>{isUploading ? "Uploading..." : "Upload"}</span>
            </button>
          </form>
        </div>
      ) : null}

      <div className="project-upload-list" style={{ marginTop: canUpload && activeCategory ? '24px' : '0' }}>
        {activeCategory ? (
          <>
            <button className="back-link" onClick={() => setActiveCategoryId(null)} style={{ marginBottom: '16px' }}>
              <PortalIcon name="left" /> Back to Categories
            </button>
            <div className="category-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}><PortalIcon name="folder" /> {activeCategory.name}</h3>
              {canUpload && (
                <div className="category-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button className="table-action-button" onClick={() => openRenameModal(activeCategory)}>Rename</button>
                  <button className="table-action-button" onClick={() => handleDeleteCategory(activeCategory)} style={{ color: 'var(--color-danger)' }}>Delete</button>
                </div>
              )}
            </div>
            
            {activeCategory.documents.length ? (
              activeCategory.documents.map((doc) => (
                <article className="project-upload-row" key={doc.id}>
                  <div>
                    <strong>{doc.name}</strong>
                    <span>{fileSizeText(doc.size)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a className="table-action-button" href={uploadDownloadUrl(doc.uploadId || doc.id)} rel="noreferrer" target="_blank">
                      <PortalIcon name="download" />
                      <span>Download</span>
                    </a>
                    {canUpload && (
                      <button className="table-action-button" onClick={() => handleDeleteDocument(doc)} style={{ color: 'var(--color-danger)' }}>
                        <PortalIcon name="delete" />
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-empty-row">This folder is empty.</div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              {canUpload && (
                <Button 
                  onClick={() => {
                    setNewCategoryName("");
                    setIsCreateVisible(true);
                  }}
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    borderColor: 'var(--color-danger)',
                  }}
                >
                  <PortalIcon name="plus" /> Create Category
                </Button>
              )}
            </div>

            {categories.filter(c => c.id !== "uncategorized").length > 0 && (
              <div className="document-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {categories.filter(c => c.id !== "uncategorized").map((category) => (
                  <div 
                    key={category.id} 
                    className="document-folder" 
                    onClick={() => setActiveCategoryId(category.id)}
                    style={{ 
                      border: '1px solid var(--color-border)', 
                      borderRadius: '8px', 
                      padding: '24px 16px', 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--color-surface)',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                  >
                    <div style={{ color: 'var(--color-primary)', display: 'flex' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <strong style={{ textAlign: 'center', fontSize: '15px' }}>{category.name}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>{category.documents?.length || 0} documents</span>
                  </div>
                ))}
              </div>
            )}

            {rootDocuments.length > 0 && (
              <>
                {categories.filter(c => c.id !== "uncategorized").length > 0 && (
                  <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Uncategorized Documents</h3>
                )}
                {rootDocuments.map((doc) => (
                  <article className="project-upload-row" key={doc.id}>
                    <div>
                      <strong>{doc.name}</strong>
                      <span>{fileSizeText(doc.size)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a className="table-action-button" href={uploadDownloadUrl(doc.uploadId || doc.id)} rel="noreferrer" target="_blank">
                        <PortalIcon name="download" />
                        <span>Download</span>
                      </a>
                      {canUpload && (
                        <button className="table-action-button" onClick={() => handleDeleteDocument(doc)} style={{ color: 'var(--color-danger)' }}>
                          <PortalIcon name="delete" />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </>
            )}

            {categories.filter(c => c.id !== "uncategorized").length === 0 && rootDocuments.length === 0 && (
              <div className="admin-empty-row">No documents or categories have been added to this project yet.</div>
            )}
          </>
        )}
      </div>

      <Modal
        title="Create Category"
        open={isCreateVisible}
        onOk={handleCreateCategory}
        onCancel={() => setIsCreateVisible(false)}
        confirmLoading={isCreating}
      >
        <Input 
          placeholder="Category Name" 
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onPressEnter={handleCreateCategory}
        />
      </Modal>

      <Modal
        title="Rename Category"
        open={!!renameCategoryTarget}
        onOk={handleRenameCategory}
        onCancel={() => setRenameCategoryTarget(null)}
        confirmLoading={isRenaming}
      >
        <Input 
          placeholder="Category Name" 
          value={renameCategoryName}
          onChange={(e) => setRenameCategoryName(e.target.value)}
          onPressEnter={handleRenameCategory}
        />
      </Modal>
    </div>
  );
}

export default ProjectAttachmentsPanel;
