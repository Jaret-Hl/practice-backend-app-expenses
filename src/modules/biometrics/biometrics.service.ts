import { applySearchFilter } from "../../shared/filters/search.js";
import { supabase } from "../../core/db.js";

export class BiometricService {
  static async getAll({ status, search }: { status?: boolean; search?: string }) {
    let query = supabase.from("biometric_device").select("*, tenant:tenant_id(id, name)");

    if (status !== undefined) {
      query = query.eq("status", status);
    }

    if (search) {
      try {
        query = applySearchFilter(query, search, ["serial_number", "model", "observations"]);
      } catch (err: any) {
        return {error: err.message}
      }
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  static async getById(id: number) {
    return await supabase
      .from("biometric_device")
      .select("*, tenant:tenant_id(id, name)")
      .eq("id", id)
      .single();
  }

  static async create(payload: any) {
    return await supabase.from("biometric_device").insert([payload]).select("*, tenant:tenant_id(id, name)");
  }

  static async update(id: number, payload: any) {
    return await supabase
      .from("biometric_device")
      .update(payload)
      .eq("id", id)
      .select("*, tenant:tenant_id(id, name)");
  }

  static async delete(id: number) {
    return await supabase.from("biometric_device").delete().eq("id", id).select();
  }
}
