import { Router } from "express";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Query from "../models/Query"; // Make sure this is the correct path to your model

const router = Router();
dotenv.config();

router.get("/response", (req: Request, res: Response) => {
  res.send("API is working as expected");
});

router.post("/contact", async (req: Request, res: Response) => {
  try {
    // Create a new Query instance from the request body
    const query = new Query(req.body);

    // Save the query and await its result
    const data = await query.save();

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'outlook',
      auth: {
        user: "nodejstester123@outlook.com",
        pass: "Cartownhess53"
      }
    });

    // Email options
    const mailOptions = {
      from: 'nodejstester123@outlook.com',
      to: process.env.DEV_EMAIL,  // Make sure DEV_EMAIL is set in your .env file
      subject: `${query.clientFirstName} Has Requested a website/app. Details:`,
      text: `Hello Mr.Hosein, here are the details of the client that has requested a website/app: \n
        Student Name: ${query.clientFirstName}\n
        Student Email: ${query.clientEmail}\n
        Student Phone: ${query.clientPhoneNumber}\n
        Query: ${query.clientQuery}\n
        Best Regards`,
    };

    // Send email using nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Send response back to the client
    res.status(200).send(data);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: "Failed to save query or send email" });
  }
});

module.exports=router;
