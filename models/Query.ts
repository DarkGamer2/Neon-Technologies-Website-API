import mongoose from "mongoose";
import { Schema } from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Ensure MONGO_URI is defined in the environment
const mongoURI = process.env.MONGO_URI as string;

mongoose.connect(mongoURI, {
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define the query schema
const querySchema = new Schema({
  clientFirstName: {
    type: String,
    required: true,
  },
  clientLastName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Basic email validation
  },
  clientPhoneNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/, // Phone number validation for 10 digits
  },
  clientQuery: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create the model for the Query collection
const Query = mongoose.model("Query", querySchema);

export default Query;
