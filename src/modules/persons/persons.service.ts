import { applyDynamicFilters } from "../../shared/filters/dynamic-filter.js";
import { supabase } from "../../core/db.js";
import { PERSONS_FILTERABLE_FIELDS } from "./persons.filters.js";

export class PersonService {
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
    let query = supabase.from("persons").select("*", { count: "exact" });

    if (filters) {
      query = applyDynamicFilters(query, filters, PERSONS_FILTERABLE_FIELDS);
    }

    const term = search?.trim() ?? "";
    if (term.length >= 3) {
      query = query.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,curp.ilike.%${term}%,rfc.ilike.%${term}%`,
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

  static async getById(id: number) {
    return await supabase.from("persons").select("*").eq("id", id).single();
  }

  /**
   * Busca personas existentes por email o CURP. Úsalo antes de crear una
   * persona nueva desde otro módulo (contactos, empleados, usuarios) para
   * evitar duplicados — ese es justo el problema que resuelve esta tabla.
   */
  static async findExisting({ email, curp }: { email?: string; curp?: string }) {
    if (!email && !curp) return { data: [], error: null };

    const conditions: string[] = [];
    if (email) conditions.push(`email.eq.${email}`);
    if (curp) conditions.push(`curp.eq.${curp}`);

    return await supabase.from("persons").select("*").or(conditions.join(","));
  }

  static async create(payload: any) {
    return await supabase.from("persons").insert([payload]).select();
  }

  static async update(id: number, payload: any) {
    return await supabase
      .from("persons")
      .update(payload)
      .eq("id", id)
      .select();
  }

  static async delete(id: number) {
    return await supabase.from("persons").delete().eq("id", id).select();
  }
}
