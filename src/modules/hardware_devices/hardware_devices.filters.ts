import { FilterableFields } from "../../shared/filters/dynamic-filter.js";

export const HARDWARE_DEVICES_FILTERABLE_FIELDS: FilterableFields = {
  serial_number: { type: "exact" },
  code_device: { type: "ilike" },
  created_by_user_id: { type: "in" },
  created_at: { type: "date_range" },
};