import { Request, Response } from "express";
import { RBACService } from "./rbac.service.js";

// Asignar rol a usuario
export const assignRoleToUser = async (req: Request, res: Response) => {
  const { userId, roleId } = req.params;
  
  const { data, error } = await RBACService.assignRoleToUser(
    Number(userId),
    Number(roleId)
  );

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(201).json({ 
    message: "Rol asignado exitosamente",
    data 
  });
};

// Remover rol de usuario
export const removeRoleFromUser = async (req: Request, res: Response) => {
  const { userId, roleId } = req.params;
  
  const { data, error } = await RBACService.removeRoleFromUser(
    Number(userId),
    Number(roleId)
  );

  if (error) {
    return res.status(500).json({ error: "Error al remover rol" });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Asignación no encontrada" });
  }

  res.json({ message: "Rol removido exitosamente" });
};

// Asignar permiso a rol
export const assignPermissionToRole = async (req: Request, res: Response) => {
  const { roleId, permissionId } = req.params;
  
  const { data, error } = await RBACService.assignPermissionToRole(
    Number(roleId),
    Number(permissionId)
  );

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(201).json({ 
    message: "Permiso asignado exitosamente",
    data 
  });
};

// Remover permiso de rol
export const removePermissionFromRole = async (req: Request, res: Response) => {
  const { roleId, permissionId } = req.params;
  
  const { data, error } = await RBACService.removePermissionFromRole(
    Number(roleId),
    Number(permissionId)
  );

  if (error) {
    return res.status(500).json({ error: "Error al remover permiso" });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Asignación no encontrada" });
  }

  res.json({ message: "Permiso removido exitosamente" });
};