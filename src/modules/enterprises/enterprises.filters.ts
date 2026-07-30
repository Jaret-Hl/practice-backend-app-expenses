import { FilterableFields } from "../../shared/filters/dynamic-filter.js";

export const ENTERPRISE_FILTERABLE_FIELDS: FilterableFields = {
  is_active: { type: "boolean" },
  plaza: { type: "exact" },
  code_enterprise: { type: "ilike" },
  created_by_user_id: { type: "in" },
  created_at: { type: "date_range" },
};