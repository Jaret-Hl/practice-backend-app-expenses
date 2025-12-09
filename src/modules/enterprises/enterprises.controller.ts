import { Request, Response } from "express";
import { EnterpriseService } from "./enterprises.service.js";

export const getEnterprises = async (req: Request, res: Response) => {
  const { active_cyh, search } = req.query;

  const { data, error } = await EnterpriseService.getAll({
    active_cyh: active_cyh as string,
    search: search as string,
  });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};

export const getEnterpriseById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { data, error } = await EnterpriseService.getById(id);

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Empresa no encontrado" });

  res.json(data);
};

export const createEnterprise = async (req: Request, res: Response) => {
  const { data, error } = await EnterpriseService.create(req.body);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
};

export const updateEnterprise = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const payload = {
    ...req.body,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await EnterpriseService.update(id, payload);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data[0]);
};

export const deleteEnterprise = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { error } = await EnterpriseService.delete(id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: `Empresa ${id} eliminada` });
};