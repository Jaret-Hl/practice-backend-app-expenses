import { applySearchFilter } from "../../shared/filters/search.js";
import { supabase } from "../../core/db.js";

export class EnterpriseService {
  static async getAll({
    active_cyh,
    search,
    userId,
    limit,
    offset,
  }: {
    active_cyh?: string;
    search?: string;
    userId?: number;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase.from("enterprise").select("*", { count: "exact" });

    if (active_cyh !== undefined) {
      query = query.eq("active_cyh", active_cyh === "true");
    }

    // if (search) {
    //   try {
    //     query = applySearchFilter(query, search, ["name", "code_enterprise"]);
    //   } catch (err: any) {
    //     return { error: err.message };
    //   }
    // }

    const term = typeof search === "string" ? search.trim() : "";
    if(term.length >= 3) {
      const like = `%${term}%`;
      query = query.or(`name.ilike.${like},code_enterprise.ilike.${like}`);
    } else if (term.length > 0) {
      return { error: "El término de búsqueda debe tener al menos 3 caracteres" };
    }

    // Apply pagination
    if (limit && offset !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;
    return { data, error, count };
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
