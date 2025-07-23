import express from 'express';
import dotenv from 'dotenv';
import {PORT } from './config.js';

import expensesRoutes from './routes/expenses.routes.js';
import morgan from 'morgan';
dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use('/api', expensesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});