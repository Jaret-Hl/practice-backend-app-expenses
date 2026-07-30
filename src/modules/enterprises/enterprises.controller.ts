import { Request, Response } from "express";
import { EnterpriseService } from "./enterprises.service.js";
import { EnterpriseUpdateSchema } from "./enterprises.schema.js";
import { parsePagination, formatPaginatedResponse } from "../../shared/utils/pagination.js";
import { supabase } from '../../core/db.js';

import { extractFilters } from "../../shared/filters/extract-filters.js";
import { ENTERPRISE_FILTERABLE_FIELDS } from "./enterprises.filters.js";

const FACET_ALLOWED_FIELDS = ["plaza"]; // whitelist: solo campos categorizables


export const getEnterprises = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const pagination = parsePagination(page as string | number, limit as string | number);
  const filters = extractFilters(req.query, ENTERPRISE_FILTERABLE_FIELDS);

  const { data, error, count } = await EnterpriseService.getAll({
    search: search as string,
    filters,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  
  const totalCount = count || 0;
  const formattedResponse = formatPaginatedResponse(data || [], pagination.page, pagination.limit, totalCount);
  res.json(formattedResponse);
};

export const getEnterpriseFacets = async (req: Request, res: Response) => {
  const fields = String(req.query.fields || "")
    .split(",")
    .map((f) => f.trim())
    .filter((f) => FACET_ALLOWED_FIELDS.includes(f));

  const results: Record<string, string[]> = {};

  for (const field of fields) {
    const { data, error } = await EnterpriseService.getFacetValues(field);
    if (!error) results[field] = data as string[];
  }

  res.json(results);
};

export const getEnterpriseById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { data, error } = await EnterpriseService.getById(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  if (!data) return res.status(404).json({ error: "Empresa no encontrada" });

  res.json(data);
};

export const createEnterprise = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = {
    ...req.body,
    created_by_user_id: userId,
  };

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  const { data, error } = await EnterpriseService.create(payload);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.status(201).json(data[0]);
};

export const updateEnterprise = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Verificar que la empresa existe
  const { data: existingEnterprise, error: fetchError } = await EnterpriseService.getById(id);

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });
  if (!existingEnterprise) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  const updatedEnterprise = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: userId,
  };

  const { data, error} = await supabase
    .from("enterprise")
    .update(updatedEnterprise)
    .eq("id", id)
    .select()

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data[0]);

};

export const deleteEnterprise = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado" });
  }

  // Verificar que la empresa existe
  const { data: existingEnterprise, error: fetchError } = await EnterpriseService.getById(id);

  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });
  if (!existingEnterprise) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  const { error } = await EnterpriseService.delete(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json({ message: `Empresa ${id} eliminada` });
};