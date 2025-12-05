import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {PORT } from './config.js';

import expensesRoutes from './modules/expenses/expenses.routes.js';
import tenantsRoutes from './modules/tenants/tenant.routes';
import enterprisesRoutes from './modules/enterprises/enterprises.routes';
import morgan from 'morgan';
dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', expensesRoutes);
app.use('/api', tenantsRoutes);
app.use('/api', enterprisesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});