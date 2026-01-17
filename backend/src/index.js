//const express = require('express');
import express from 'express';
import cors from 'cors';
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import animalRoutes from "./routes/animalRoutes.js";
import adoptionRoutes from "./routes/adoptionRoutes.js";
import pool from "./config/database.js";

const app = express();
const port = process.env.PORT || 3000;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration for Expo
app.use(cors({
  origin: '*', // In production, replace with your Expo app URL or specific origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/adoption", adoptionRoutes);

// Test database connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL database connected successfully!');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Error connecting to MySQL database:', error.message);
  });

console.log({ port });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});