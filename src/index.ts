import path from "path";
import dotenv from "dotenv";

// Busca el .env en la RAÍZ del proyecto
const root = path.resolve(process.cwd(), ".");
const envFile = `.env.${process.env.NODE_ENV || "development"}`;

dotenv.config({ path: path.join(root, envFile) });
dotenv.config({ path: path.join(root, ".env") });



import { startServer } from "./core/server.js";

startServer();
