import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Query from "../models/Query"; // Ensure the correct path to your model
const {body}=require("express-validator");
const {validationResult}=require("express-validator") // Correct import style for express-validator
import rateLimit from "express-rate-limit"; // Validation library for input validation
import { createLogger, transports, format } from 'winston'; // Logging library for production

dotenv.config();

const router = Router();

// Create a logger for production
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({ format: format.simple() }),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// Define rate limit for the contact route
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later."
});

// Route for checking if the API is working
router.get("/response", (req: Request, res: Response) => {
  res.status(200).send("API is working as expected");
});

// Middleware to validate incoming data
const validateQueryData = [
  body('clientFirstName').isString().withMessage('First Name is required'),
  body('clientLastName').isString().withMessage('Last Name is required'),
  body('clientEmail').isEmail().withMessage('Valid Email is required'),
  body('clientPhoneNumber').isMobilePhone().withMessage('Valid Phone Number is required'),
  body('clientQuery').isString().withMessage('Query is required'),
];

// POST route to handle the contact form submission
router.post("/contact", contactLimiter, validateQueryData, async (req: Request, res: Response) => {
  // Validate the request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create a new Query instance from the request body
    const query = new Query(req.body);

    // Save the query to the database
    const data = await query.save();

    // Set up Nodemailer transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.EMAIL_USER, // Fetch credentials from environment variables
        pass: process.env.EMAIL_PASS,
      }
    });

    // Email content configuration
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: process.env.DEV_EMAIL,    // Receiver address from the environment variable
      subject: `${query.clientFirstName} has requested a website/app. Details:`,
      text: `
        Hello Mr. Hosein, here are the details of the client that has requested a website/app:

        Client Name: ${query.clientFirstName} ${query.clientLastName}
        Client Email: ${query.clientEmail}
        Client Phone: ${query.clientPhoneNumber}
        Query: ${query.clientQuery}

        Best Regards
      `,
    };

    // Send the email asynchronously and handle errors
    await transporter.sendMail(mailOptions);

    // Respond to the client with the saved query data
    res.status(200).send(data);

  } catch (error) {
    logger.error('Error occurred during contact form submission', { error });
    res.status(500).send({ error: "Failed to save query or send email" });
  }
});

export default router;
