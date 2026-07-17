import { applySearchFilter } from "./../../../../shared/filters/search.js";
import { supabase } from "../../../../core/db.js";

// obtener solo datos sin aplicar paginación ni busqueda solo se requiere para lectura de datos de riesgo de empresas
export class EnterpriseRiskRateService {

static async getAll({
    search,
    userId,
    enterpriseId,
  }: {
    search?: string;
    userId?: number;
    enterpriseId?: number;
  }) {
    let query = supabase.from("enterprise_risk_rate").select("*");

    if (enterpriseId !== undefined) {
      query = query.eq("enterprise_id", enterpriseId);
    }

    const { data, error } = await query;
    return { data, error };
  }

  static async getById(riskRateId: number, enterpriseId?: number) {
    let query = supabase.from("enterprise_risk_rate").select("*").eq("id", riskRateId);

    if (enterpriseId !== undefined) {
      query = query.eq("enterprise_id", enterpriseId);
    }

    return await query.single();
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
