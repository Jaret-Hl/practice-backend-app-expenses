import express from "express";
import cors from "cors";
import morgan from "morgan";

// Rutas
import tenantsRoutes from "../modules/tenants/tenant.routes.js";
import expensesRoutes from "../modules/expenses/expenses.routes.js";
import enterprisesRoutes from "../modules/enterprises/enterprises.routes.js";

// dotenv.config(); // <-- eliminado

export const startServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api", tenantsRoutes);
  app.use("/api", expensesRoutes);
  app.use("/api", enterprisesRoutes);

  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });

  return app;
};
