import { Request, Response } from "express";
import { EnterpriseContactService } from "./enterprise-contact.service.js";

export const getEnterpriseContacts = async (req: Request, res: Response) => {
  const enterpriseId = Number(req.params.enterpriseId);
  if (!enterpriseId) return res.status(400).json({ error: "ID de empresa inválido" });

  const { data, error } = await EnterpriseContactService.getAllByEnterprise(enterpriseId);
  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json(data);
};

export const createEnterpriseContact = async (req: Request, res: Response) => {
  const enterpriseId = Number(req.params.enterpriseId);
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Usuario no autenticado" });
  if (!enterpriseId) return res.status(400).json({ error: "ID de empresa inválido" });

  const { data, error } = await EnterpriseContactService.create(enterpriseId, req.body, userId);
  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.status(201).json(Array.isArray(data) ? data[0] : data);
};

export const deleteEnterpriseContact = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "ID inválido" });

  const { error } = await EnterpriseContactService.delete(id);
  if (error) return res.status(500).json({ error: "Error interno del servidor" });

  res.json({ message: `Contacto ${id} eliminado` });
};
