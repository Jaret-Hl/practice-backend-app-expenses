import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {PORT } from './config.js';

import expensesRoutes from './routes/expenses.routes.js';
import tenantsRoutes from './routes/tenant.routes.js';
import morgan from 'morgan';
dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', expensesRoutes);
app.use('/api', tenantsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});