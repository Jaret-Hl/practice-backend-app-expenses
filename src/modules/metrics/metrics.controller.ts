import { Request, Response } from "express";
import { supabase } from "../../core/db.js";

export const getOverviewMetrics = async (_req: Request, res: Response) => {
  try {
    const [
      enterprisesRes,
      tenantsRes,
      usersRes,
      biometricsRes,
    ] = await Promise.all([
      supabase.from("enterprise").select("id", { count: "exact", head: true }),
      supabase.from("tenant").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("biometric_device").select("id", { count: "exact", head: true }),
    ]);

    const [
      activeEnterprisesRes,
      activeTenantsRes,
      activeUsersRes,
      activeBiometricsRes,
    ] = await Promise.all([
      supabase.from("enterprise").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("tenant").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("biometric_device").select("id", { count: "exact", head: true }).eq("status", true),
    ]);

    res.json({
      totals: {
        enterprises: enterprisesRes.count ?? 0,
        tenants: tenantsRes.count ?? 0,
        users: usersRes.count ?? 0,
        biometrics: biometricsRes.count ?? 0,
      },
      byStatus: {
        enterprises: {
          active: activeEnterprisesRes.count ?? 0,
          inactive: (enterprisesRes.count ?? 0) - (activeEnterprisesRes.count ?? 0),
        },
        tenants: {
          active: activeTenantsRes.count ?? 0,
          inactive: (tenantsRes.count ?? 0) - (activeTenantsRes.count ?? 0),
        },
        users: {
          active: activeUsersRes.count ?? 0,
          inactive: (usersRes.count ?? 0) - (activeUsersRes.count ?? 0),
        },
        biometrics: {
          active: activeBiometricsRes.count ?? 0,
          inactive: (biometricsRes.count ?? 0) - (activeBiometricsRes.count ?? 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener métricas" });
  }
};