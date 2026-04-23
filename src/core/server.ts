import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { authMiddleware } from "../shared/middlewares/auth.middleware.js";
import { errorHandler } from "../core/errors/error.handler.js";
import { ENV } from "./env.js";
// Rutas
import authRoutes from "../modules/auth/auth.routes.js";
import tenantsRoutes from "../modules/tenants/tenant.routes.js";
import expensesRoutes from "../modules/expenses/expenses.routes.js";
import enterprisesRoutes from "../modules/enterprises/enterprises.routes.js";
import biometricRoutes from "../modules/biometrics/biometric.routes.js";

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Demasiados intentos de login, intenta de nuevo más tarde",
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export const startServer = () => {
  const app = express();

  // Security middleware - Helmet for HTTP headers
  app.use(helmet());

  // CORS with specific allowed origins (not wildcard)
  const allowedOrigins = ENV.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  // Body parser with size limit to prevent payload bombs
  app.use(express.json({ limit: "1mb" }));

  // Logging - use 'combined' format in production, 'dev' in development
  app.use(morgan(ENV.NODE_ENV === "production" ? "combined" : "dev"));

  // General rate limiting on all requests
  app.use(generalLimiter);

  // Auth routes with specific rate limiting
  app.use("/api/auth", authLimiter, authRoutes);

  // Protect all other /api routes with auth middleware
  app.use("/api", authMiddleware);

  app.use("/api", tenantsRoutes);
  app.use("/api", expensesRoutes);
  app.use("/api", enterprisesRoutes);
  app.use("/api", biometricRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
  });

  return app;
};
