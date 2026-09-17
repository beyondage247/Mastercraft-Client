export const ALL_CATEGORIES_FILTER = "All";
export const UNCATEGORIZED_FILTER = "__uncategorized__";

export function matchesCategoryFilter(categoryId: string | undefined, filter: string) {
  if (filter === ALL_CATEGORIES_FILTER) {
    return true;
  }

  if (filter === UNCATEGORIZED_FILTER) {
    return !categoryId;
  }

  return categoryId === filter;
}
