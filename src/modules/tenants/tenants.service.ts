import { applySearchFilter } from "../../shared/filters/search.js";
import { supabase } from "../../core/db.js";

export class TenantService {
  static async getAll({ is_active, search }: { is_active?: string; search?: string }) {
    let query = supabase.from("tenant").select("*");

    if (is_active !== undefined) {
      query = query.eq("is_active", is_active === "true");
    }

    if (search) {
      try {
        query = applySearchFilter(query, search, ["name", "description"]);
      } catch (err: any) {
        return {error: err.message}
      }
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  static async getById(id: number) {
    return await supabase
      .from("tenant")
      .select("*")
      .eq("id", id)
      .single();
  }

  static async create(payload: any) {
    return await supabase.from("tenant").insert([payload]).select();
  }

  static async update(id: number, payload: any) {
    return await supabase
      .from("tenant")
      .update(payload)
      .eq("id", id)
      .select();
  }

  static async delete(id: number) {
    return await supabase.from("tenant").delete().eq("id", id).select();
  }
}
