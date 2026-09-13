import type { CatalogItem } from "../services/portalApi";
import type { LineItem } from "../data/portal";

export function buildCatalogLookup(catalogItems: CatalogItem[]): Map<string, CatalogItem> {
  return new Map(catalogItems.map((item) => [item.id, item]));
}

function uniqueJoin(values: Array<string | undefined>): string {
  const unique = Array.from(new Set(values.filter((value): value is string => Boolean(value))));
  return unique.join(", ");
}

/** Resolve category/subcategory/supplier for a set of line items via their catalog serviceId. */
export function describeLineItemTaxonomy(
  lineItems: LineItem[] | undefined,
  catalogById: Map<string, CatalogItem>,
): { category: string; subcategory: string; supplier: string } {
  const items = lineItems ?? [];
  const catalogEntries = items
    .map((line) => (line.serviceId ? catalogById.get(line.serviceId) : undefined))
    .filter((item): item is CatalogItem => Boolean(item));

  return {
    category: uniqueJoin(catalogEntries.map((item) => item.category)),
    subcategory: uniqueJoin(catalogEntries.map((item) => item.subcategory)),
    supplier: uniqueJoin(catalogEntries.map((item) => item.supplier)),
  };
}
