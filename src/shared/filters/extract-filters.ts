import { FilterableFields } from "./dynamic-filter.js";

export function extractFilters(query: Record<string, any>, config: FilterableFields) {
  const allowedKeys = Object.keys(config);
  const filters: Record<string, any> = {};

  for (const key of allowedKeys) {
    if (query[key] !== undefined) {
      filters[key] = query[key];
    }
  }
  return filters;
}