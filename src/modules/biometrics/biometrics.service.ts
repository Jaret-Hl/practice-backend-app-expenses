import { applySearchFilter } from "../../shared/filters/search.js";
import { supabase } from "../../core/db.js";

// Decisión #5 confirmada: biometric_device ahora se relaciona por empresa,
// no por tenant (tenant_id queda deprecated en la tabla, no se lee aquí).
const BIOMETRIC_SELECT = "*, enterprise:enterprise_id(id, name)";

export class BiometricService {
  static async getAll({ status, search }: { status?: boolean; search?: string }) {
    let query = supabase.from("biometric_device").select(BIOMETRIC_SELECT);

    if (status !== undefined) {
      query = query.eq("status", status);
    }

    if (search) {
      try {
        query = applySearchFilter(query, search, ["serial_number", "model", "observations"]);
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async getById(id: number) {
    return await supabase
      .from("biometric_device")
      .select(BIOMETRIC_SELECT)
      .eq("id", id)
      .single();
  }

  static async create(payload: any) {
    return await supabase.from("biometric_device").insert([payload]).select(BIOMETRIC_SELECT);
  }

  static async update(id: number, payload: any) {
    return await supabase
      .from("biometric_device")
      .update(payload)
      .eq("id", id)
      .select(BIOMETRIC_SELECT);
  }

  static async delete(id: number) {
    return await supabase.from("biometric_device").delete().eq("id", id).select();
  }
}
