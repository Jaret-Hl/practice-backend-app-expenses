import { Request, Response } from "express";
import { EnterpriseRiskRateService } from "../enterprise-risk-rate/enterprise-risk-rate.service.js";
// import { EnterpriseUpdateSchema } from "../enterprise-risk-rate/enterprise-risk-rate.schema.js";

// obtener solo datos sin aplicar paginación ni busqueda solo se requiere para lectura de datos de riesgo de empresas
export const getEnterprisesRiskRate = async (req: Request, res: Response) => {
    const { search } = req.query;
    const enterpriseId = Number(req.params.enterpriseId);

    const userId = req.user?.id;

    const { data, error } = await EnterpriseRiskRateService.getAll({
        search: search as string,
        userId,
        enterpriseId: isNaN(enterpriseId) ? undefined : enterpriseId,
    });

    if (error) return res.status(500).json({ error: "Error interno del servidor" });

    res.json(data);
};

export const getEnterpriseRiskRateById = async (req: Request, res: Response) => {
    const { enterpriseId, riskRateId } = req.params;

    if (!enterpriseId || !riskRateId) return res.status(400).json({ error: "ID inválido" });

    const enterpriseIdNumber = Number(enterpriseId);
    const riskRateIdNumber = Number(riskRateId);

    if (isNaN(enterpriseIdNumber) || isNaN(riskRateIdNumber)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const { data, error } = await EnterpriseRiskRateService.getById(riskRateIdNumber, enterpriseIdNumber);

    if (error) return res.status(500).json({ error: "Error interno del servidor" });
    if (!data) return res.status(404).json({ error: "Prima de riesgo no encontrada" });

    res.json(data);
};