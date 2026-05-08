import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { PortalIcon } from '../../components/PortalIcon';
import StatusBadge from '../../components/StatusBadge';
import { documents } from '../../data/portal';
import type { DocumentType } from '../../data/portal';

type DocumentFilter = 'All types' | DocumentType;

const typeFilters: DocumentFilter[] = ['All types', 'Shop drawing', 'CAD File', 'Spec Sheet', 'Photo'];
const projectFilters = ['All projects', ...Array.from(new Set(documents.map((document) => document.project)))];

function Documents() {
  const [projectFilter, setProjectFilter] = useState('All projects');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentFilter>('All types');

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesType = typeFilter === 'All types' || document.type === typeFilter;
      const matchesProject = projectFilter === 'All projects' || document.project === projectFilter;
      const matchesSearch =
        !normalizedSearch ||
        [document.title, document.project, document.type].join(' ').toLowerCase().includes(normalizedSearch);

      return matchesType && matchesProject && matchesSearch;
    });
  }, [projectFilter, search, typeFilter]);

  return (
    <div className="page-stack">
      <PageHeader actionLabel="Upload Document" subtitle="Project files, drawings, and specifications" title="Documents" />

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

      <section className="documents-grid" aria-label="Documents">
        {filteredDocuments.map((document) => (
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
              <h2>{document.title}</h2>
              <p>
                <PortalIcon name="projects" />
                {document.project}
              </p>
              <p>
                <PortalIcon name="calendar" />
                {document.date}
              </p>
            </div>
          </article>
        ))}
      </section>

      <p className="result-count">
        Showing {filteredDocuments.length} of {documents.length} documents
      </p>
    </div>
  );
}

export default Documents;
