import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendEmail } from "./utils/mailer";
import logger from "./utils/logger";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (_req, res) => {
  logger.info("GET / - Wallet Tracker is up");
  res.send("Welcome to Wallet Tracker");
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });

  if (process.env.NODE_ENV !== "production") {
    sendEmail([process.env.EMAIL_USER!], "Critical Server Error", `Error: ${err.message}\nStack: ${err.stack}`);
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
