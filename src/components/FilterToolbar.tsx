import { PortalIcon } from './PortalIcon';

export type FilterOption<T extends string> = {
  label: string;
  value: T;
};

type FilterToolbarProps<T extends string> = {
  activeFilter: T;
  filters: FilterOption<T>[];
  onFilterChange: (value: T) => void;
  onSearchChange: (value: string) => void;
  search: string;
  searchLabel: string;
};

function FilterToolbar<T extends string>({
  activeFilter,
  filters,
  onFilterChange,
  onSearchChange,
  search,
  searchLabel,
}: FilterToolbarProps<T>) {
  return (
    <section className="filter-toolbar" aria-label={`${searchLabel} filters`}>
      <div className="segmented-control" role="tablist" aria-label={`${searchLabel} status`}>
        {filters.map((filter) => (
          <button
            aria-selected={activeFilter === filter.value}
            className={`segmented-control__item${activeFilter === filter.value ? ' is-active' : ''}`}
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            role="tab"
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <label className="search-field">
        <PortalIcon name="search" />
        <input
          aria-label={`Search ${searchLabel}`}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search"
          type="search"
          value={search}
        />
      </label>
    </section>
  );
}

export default FilterToolbar;
