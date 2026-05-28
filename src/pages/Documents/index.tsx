import { useEffect, useMemo, useState } from 'react';
import { getCurrentPortalUser } from '../../auth/session';
import PageHeader from '../../components/PageHeader';
import { PortalIcon } from '../../components/PortalIcon';
import StatusBadge from '../../components/StatusBadge';
import { documents } from '../../data/portal';
import type { DocumentItem, DocumentType } from '../../data/portal';
import { getDocuments } from '../../services/portalApi';

type DocumentFilter = 'All types' | DocumentType;

const typeFilters: DocumentFilter[] = ['All types', 'Shop drawing', 'CAD File', 'Spec Sheet', 'Photo'];
function Documents() {
  const currentUser = getCurrentPortalUser();
  const isBackOffice = currentUser?.role === 'admin' || currentUser?.role === 'staff';
  const [documentList, setDocumentList] = useState<DocumentItem[]>(documents);
  const [projectFilter, setProjectFilter] = useState('All projects');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentFilter>('All types');

  useEffect(() => {
    let isMounted = true;

    getDocuments().then((data) => {
      if (isMounted) {
        setDocumentList(data.documents);
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

  const documentGroups = useMemo(() => {
    const groups = new Map<string, DocumentItem[]>();

    filteredDocuments.forEach((document) => {
      const key = document.project || 'Unassigned project';
      groups.set(key, [...(groups.get(key) ?? []), document]);
    });

    return Array.from(groups.entries()).map(([project, items]) => ({ items, project }));
  }, [filteredDocuments]);

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
        {documentGroups.map((group) => (
          <article className="document-project-group" key={group.project}>
            <div className="document-project-group__header">
              <h2>{group.project}</h2>
              <span>{group.items.length} documents</span>
            </div>
            <div className="documents-grid" aria-label={`${group.project} documents`}>
              {group.items.map((document) => (
                <article className="document-card" key={document.id}>
                  <div className="document-card__preview">
                    {document.imageUrl ? (
                      <img alt="" src={document.imageUrl} />
                    ) : (
                      <>
                        <span className="document-card__icon">
                          <PortalIcon name={document.title.includes('Approval') ? 'check' : document.type === 'Shop drawing' ? 'projects' : 'documents'} />
                        </span>
                        <StatusBadge tone="danger">{document.type}</StatusBadge>
                      </>
                    )}
                  </div>
                  <div className="document-card__body">
                    <h3>{document.title}</h3>
                    <p>
                      <PortalIcon name="calendar" />
                      {document.date || 'Not set'}
                    </p>
                    {document.downloadUrl ? (
                      <a className="table-action-button" href={document.downloadUrl} rel="noreferrer" target="_blank">
                        <PortalIcon name="download" />
                        <span>Download</span>
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
        {!documentGroups.length ? (
          <div className="panel">No documents match this view.</div>
        ) : null}
      </section>

      <p className="result-count">
        Showing {filteredDocuments.length} of {documentList.length} documents
      </p>
    </div>
  );
}

export default Documents;
