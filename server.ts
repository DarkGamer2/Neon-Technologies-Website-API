import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createLogger, transports, format } from 'winston';
import contactRoutes from "./routes/contactRoutes"; // Use ES Module import instead of require

// Load environment variables before anything else
dotenv.config();

// Initialize Express app
const app = express();

// Set up Winston logger for both development and production
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({ format: format.simple() }),
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// Middleware: Security headers
app.use(helmet());

// Middleware: Enable CORS with proper options (in production, only allow certain origins)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Allow all origins or restrict to a specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware: JSON body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTTP request logging using Morgan in development (or production with logs to file)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting middleware to protect API from abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow only 100 requests per IP
  message: "Too many requests, please try again later.",
});
app.use("/api/neon_tech", apiLimiter);  // Apply rate limiter to the contact routes

// API Routes
app.use("/api/neon_tech", contactRoutes);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Closed out remaining connections.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Closed out remaining connections.");
    process.exit(0);
  });
});

// Start server and handle port configuration
const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Server is running on port ${process.env.PORT || 3000}`);
});

