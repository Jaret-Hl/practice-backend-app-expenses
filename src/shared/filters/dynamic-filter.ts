export type FilterType = "boolean" | "exact" | "ilike" | "in" | "date_range" | "number_range";

export interface FilterFieldConfig {
  type: FilterType;
}

export type FilterableFields = Record<string, FilterFieldConfig>;

export function applyDynamicFilters(
  query: any,
  filters: Record<string, any>,
  config: FilterableFields,
) {
  for (const [field, rawValue] of Object.entries(filters)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;

    const fieldConfig = config[field];
    if (!fieldConfig) continue; // seguridad: ignora campos no whitelisteados

    switch (fieldConfig.type) {
      case "boolean":
        query = query.eq(field, rawValue === "true" || rawValue === true);
        break;

      case "exact":
        query = query.eq(field, rawValue);
        break;

      case "ilike":
        query = query.ilike(field, `%${rawValue}%`);
        break;

      case "in": {
        const values = Array.isArray(rawValue) ? rawValue : String(rawValue).split(",");
        query = query.in(field, values);
        break;
      }

      case "date_range": {
        const { from, to } = rawValue;
        if (from) query = query.gte(field, from);
        if (to) query = query.lte(field, to);
        break;
      }

      case "number_range": {
        const { min, max } = rawValue;
        if (min !== undefined) query = query.gte(field, min);
        if (max !== undefined) query = query.lte(field, max);
        break;
      }
    }
  }
  return query;
}