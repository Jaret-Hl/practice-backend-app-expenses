import { applySearchFilter } from "../../shared/filters/search.js";
import { applyDynamicFilters } from "../../shared/filters/dynamic-filter.js";
import { ENTERPRISE_FILTERABLE_FIELDS } from "./enterprises.filters.js";
import { supabase } from "../../core/db.js";

export class EnterpriseService {
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
    let query = supabase.from("enterprise").select("*", { count: "exact" });

    if (filters) {
      query = applyDynamicFilters(query, filters, ENTERPRISE_FILTERABLE_FIELDS);
    }

    const term = search?.trim() ?? "";
    if (term.length >= 3) {
      query = query.or(`name.ilike.%${term}%,code_enterprise.ilike.%${term}%`);
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

  static async getFacetValues(field: string) {
    // trae solo esa columna, sin duplicados, sin nulls
    const { data, error } = await supabase
      .from("enterprise")
      .select(field)
      .not(field, "is", null);

    if (error) return { error: error.message };

    const unique = Array.from(new Set(data.map((row: any) => row[field])))
      .filter(Boolean)
      .sort();

    return { data: unique };
  }

  static async getById(id: number) {
    return await supabase.from("enterprise").select("*").eq("id", id).single();
  }

  static async create(payload: any) {
    return await supabase.from("enterprise").insert([payload]).select();
  }

  static async update(id: number, payload: any) {
    return await supabase
      .from("enterprise")
      .update(payload)
      .eq("id", id)
      .select();
  }

  static async delete(id: number) {
    return await supabase.from("enterprise").delete().eq("id", id).select();
  }
}
