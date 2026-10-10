import { applyDynamicFilters } from "../../shared/filters/dynamic-filter.js";
import { supabase } from "../../core/db.js";
import { HARDWARE_DEVICES_FILTERABLE_FIELDS } from "./hardware_devices.filters.js";

export class HardwareDeviceService {
  static async getAll({
    search,
    filters,
    limit,
    offset,
  }: {
    search?: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from("hardware_device")
      .select("*", { count: "exact" });

    if (filters) {
      query = applyDynamicFilters(
        query,
        filters,
        HARDWARE_DEVICES_FILTERABLE_FIELDS,
      );
    }

    const term = search?.trim() ?? "";
    if (term.length >= 3) {
      query = query.or(
        `serial_numer.like.%${term}%,code_device.like.%${term}%`,
      );
    } else if (term.length > 0) {
      return {
        error: "El término de búsqueda debe tener al menos 3 caracteres",
      };
    }

    if (limit && offset !== undefined)
      query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    return { data, error, count };
  }
}
