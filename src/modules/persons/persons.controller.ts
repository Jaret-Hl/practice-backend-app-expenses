import { Request, Response } from "express";
import { PersonService } from "./persons.service.js";
import {
  parsePagination,
  formatPaginatedResponse,
} from "../../shared/utils/pagination.js";
import { extractFilters } from "../../shared/filters/extract-filters.js";
import { PERSONS_FILTERABLE_FIELDS } from "./persons.filters.js";

export const getPersons = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query;
  const pagination = parsePagination(
    page as string | number,
    limit as string | number,
  );
  const filters = extractFilters(req.query, PERSONS_FILTERABLE_FIELDS);

  const { data, error, count } = await PersonService.getAll({
    search: search as string,
    filters,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  if (error)
    return res.status(500).json({ error: "Error interno del servidor" });

  const totalCount = count || 0;
  res.json(
    formatPaginatedResponse(data || [], pagination.page, pagination.limit, totalCount),
  );
};

export const getPersonById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { data, error } = await PersonService.getById(id);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });
  if (!data) return res.status(404).json({ error: "Persona no encontrada" });

  res.json(data);
};

export const createPerson = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });

  const payload = { ...req.body, created_by_user_id: userId };
  const { data, error } = await PersonService.create(payload);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.status(201).json(data[0]);
};

export const updatePerson = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });

  const { data: existing, error: fetchError } = await PersonService.getById(id);
  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });
  if (!existing) return res.status(404).json({ error: "Persona no encontrada" });

  const payload = {
    ...req.body,
    updated_at: new Date().toISOString(),
    updated_by_user_id: userId,
  };
  const { data, error } = await PersonService.update(id, payload);

  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data[0]);
};

export const deletePerson = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });

  const { data: existing, error: fetchError } = await PersonService.getById(id);
  if (fetchError) return res.status(500).json({ error: "Error interno del servidor" });
  if (!existing) return res.status(404).json({ error: "Persona no encontrada" });

  const { error } = await PersonService.delete(id);
  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json({ message: `Persona ${id} eliminada` });
};
