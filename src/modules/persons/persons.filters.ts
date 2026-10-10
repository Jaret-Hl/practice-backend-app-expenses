import { FilterableFields } from "../../shared/filters/dynamic-filter.js";

export const PERSONS_FILTERABLE_FIELDS: FilterableFields = {
  curp: { type: "exact" },
  rfc: { type: "exact" },
  status: { type: "exact" },
  created_at: { type: "date_range" },
};
