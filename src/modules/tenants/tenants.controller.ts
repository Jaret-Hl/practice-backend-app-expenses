import { Request, Response } from "express";
import { TenantService } from "./tenants.service.js";

export const getTenants = async (req: Request, res: Response) => {
  const { is_active, search } = req.query;

  const { data, error } = await TenantService.getAll({
    is_active: is_active as string,
    search: search as string
  });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};

export const getTenantById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { data, error } = await TenantService.getById(id);

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Tenant no encontrado" });

  res.json(data);
};

export const createTenant = async (req: Request, res: Response) => {
  const { data, error } = await TenantService.create(req.body);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
};

export const updateTenant = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const payload = {
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await TenantService.update(id, payload);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data[0]);
};

export const deleteTenant = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { error } = await TenantService.delete(id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: `Tenant ${id} eliminado` });
};
