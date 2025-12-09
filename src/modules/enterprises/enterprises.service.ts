import { applySearchFilter } from "../../shared/filters/search.js";
import { supabase } from "../../core/db.js";

export class EnterpriseService {
  static async getAll({ active_cyh, search }: { active_cyh?: string; search?: string }) {
    let query = supabase.from("enterprise").select("*");
    if (active_cyh !== undefined) {
      query = query.eq("active_cyh", active_cyh === "SI" ? "SI" : "NO");
    }

    if (search) {
      try {
        query = applySearchFilter(query, search, ["name", "code_enterprise"]);
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const { data, error } = await query;
    return { data, error };
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
