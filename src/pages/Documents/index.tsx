import { Pagination } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getCurrentPortalUser } from '../../auth/session';
import PageHeader from '../../components/PageHeader';
import { PortalIcon } from '../../components/PortalIcon';

import type { DocumentItem, DocumentType } from '../../data/portal';
import { getDocuments } from '../../services/portalApi';

type DocumentFilter = 'All types' | DocumentType;

const typeFilters: DocumentFilter[] = ['All types', 'Shop drawing', 'CAD File', 'Spec Sheet', 'Photo'];
const pageSize = 3;

function Documents() {
  const currentUser = getCurrentPortalUser();
  const isBackOffice = currentUser?.role === 'admin' || currentUser?.role === 'staff';
  const [documentList, setDocumentList] = useState<DocumentItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState('All projects');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentFilter>('All types');
  const [activeFolder, setActiveFolder] = useState<{ project: string; folder: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError('');

    getDocuments()
      .then((data) => {
        if (isMounted) {
          setDocumentList(data.documents);
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) {
          setDocumentList([]);
          setError(requestError.message || 'Unable to load documents.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const projectFilters = useMemo(
    () => ['All projects', ...Array.from(new Set(documentList.map((document) => document.project).filter(Boolean)))],
    [documentList],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return documentList.filter((document) => {
      const matchesType = typeFilter === 'All types' || document.type === typeFilter;
      const matchesProject = projectFilter === 'All projects' || document.project === projectFilter;
      const matchesSearch =
        !normalizedSearch ||
        [document.title, document.project, document.type].join(' ').toLowerCase().includes(normalizedSearch);

      return matchesType && matchesProject && matchesSearch;
    });
  }, [documentList, projectFilter, search, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [projectFilter, search, typeFilter]);

  const paginatedDocuments = useMemo(
    () => filteredDocuments.slice((page - 1) * pageSize, page * pageSize),
    [filteredDocuments, page],
  );

  const documentGroups = useMemo(() => {
    const groups = new Map<string, DocumentItem[]>();

    paginatedDocuments.forEach((document) => {
      const key = document.project || 'Unassigned project';
      groups.set(key, [...(groups.get(key) ?? []), document]);
    });

    return Array.from(groups.entries()).map(([project, items]) => ({ items, project }));
  }, [paginatedDocuments]);

  return (
    <div className="page-stack">
      <PageHeader
        subtitle={isBackOffice ? 'All uploaded project files across the platform' : 'Project files, drawings, and specifications'}
        title="Documents"
      />

      <section className="asset-toolbar" aria-label="Document filters">
        <label className="asset-search">
          <PortalIcon name="search" />
          <input
            aria-label="Search documents"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search documents..."
            type="search"
            value={search}
          />
        </label>

        <span className="asset-toolbar__label">
          Filters: <PortalIcon name="filter" />
        </span>

        <label className="select-field">
          <select aria-label="Document type" onChange={(event) => setTypeFilter(event.target.value as DocumentFilter)} value={typeFilter}>
            {typeFilters.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
          <PortalIcon name="down" />
        </label>

        <label className="select-field">
          <select aria-label="Document project" onChange={(event) => setProjectFilter(event.target.value)} value={projectFilter}>
            {projectFilters.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
          <PortalIcon name="down" />
        </label>
      </section>

      <section className="document-project-groups" aria-label="Documents grouped by project">
        {loading ? (
          <div className="quote-payment-schedule__empty">Loading documents...</div>
        ) : error ? (
          <div className="quote-payment-schedule__empty">{error}</div>
        ) : activeFolder ? (
          <article className="document-project-group">
            <button className="back-link" onClick={() => setActiveFolder(null)} style={{ marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <PortalIcon name="left" /> Back to Folders
            </button>
            <div className="document-project-group__header" style={{ marginBottom: '16px' }}>
              <h2>{activeFolder.project} &rsaquo; {activeFolder.folder}</h2>
            </div>
            <div className="project-upload-list">
              {documentList
                .filter(d => (d.project || 'Unassigned project') === activeFolder.project && d.type === activeFolder.folder)
                .map((doc) => (
                <article className="project-upload-row" key={doc.id}>
                  <div>
                    <strong>{doc.title}</strong>
                    <span>{doc.date || 'Not set'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a className="table-action-button" href={doc.downloadUrl} rel="noreferrer" target="_blank">
                      <PortalIcon name="download" />
                      <span>Download</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ) : documentGroups.length ? (
          documentGroups.map((group) => {
            const folders = new Map<string, DocumentItem[]>();
            group.items.forEach(doc => {
              const folderName = doc.type || 'Uncategorized';
              folders.set(folderName, [...(folders.get(folderName) || []), doc]);
            });

            return (
              <article className="document-project-group" key={group.project} style={{ marginBottom: '40px' }}>
                <div className="document-project-group__header" style={{ marginBottom: '16px' }}>
                  <h2>{group.project}</h2>
                  <span>{group.items.length} total documents</span>
                </div>
                
                <div className="document-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {Array.from(folders.entries()).map(([folderName, docs]) => (
                    <div 
                      key={folderName} 
                      className="document-folder" 
                      onClick={() => setActiveFolder({ project: group.project, folder: folderName })}
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
                      <strong style={{ textAlign: 'center', fontSize: '15px' }}>{folderName}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>{docs.length} documents</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        ) : (
          <div className="quote-payment-schedule__empty">No documents match this view.</div>
        )}
      </section>

      <p className="result-count">
        Showing {paginatedDocuments.length} of {filteredDocuments.length} documents
      </p>
      <Pagination
        className="admin-client-pagination"
        current={page}
        onChange={setPage}
        pageSize={pageSize}
        showSizeChanger={false}
        total={filteredDocuments.length}
      />
    </div>
  );
}

export default Documents;
