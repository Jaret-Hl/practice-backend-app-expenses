import express from "express";
import cors from "cors";
import morgan from "morgan";

import { authMiddleware } from "../shared/middlewares/auth.middleware.js";
// Rutas
import authRoutes from "../modules/auth/auth.routes.js";
import tenantsRoutes from "../modules/tenants/tenant.routes.js";
import expensesRoutes from "../modules/expenses/expenses.routes.js";
import enterprisesRoutes from "../modules/enterprises/enterprises.routes.js";

export const startServer = () => {
  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api/auth", authRoutes);

  // Protege todas las demás rutas de /api sin tocar /api/auth/login y /api/auth/register
  app.use("/api", authMiddleware);

  app.use("/api", tenantsRoutes);
  app.use("/api", expensesRoutes);
  app.use("/api", enterprisesRoutes);

  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });

  return app;
};
