import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.route";
import { errorHandler } from "./middlewares/errorHandler.middleware";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Global error handler
app.use(errorHandler);

export default app;
