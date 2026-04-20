import { Router } from "express";
import { getEnterprises, getEnterpriseById, createEnterprise, updateEnterprise, deleteEnterprise } from "../enterprises/enterprises.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import { EnterpriseCreateSchema, EnterpriseUpdateSchema } from "./enterprises.schema.js";

const router = Router();

router.get("/enterprises", getEnterprises);
router.get("/enterprises/:id", getEnterpriseById);
router.post("/enterprises", validate(EnterpriseCreateSchema), createEnterprise);
router.put("/enterprises/:id", validate(EnterpriseUpdateSchema), updateEnterprise);
router.delete("/enterprises/:id", deleteEnterprise);

export default router;
 