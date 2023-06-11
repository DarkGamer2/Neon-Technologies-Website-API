import mongoose from "mongoose";
import { Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose.connect(`${process.env.MONGO_URI}`);
const querySchema = new Schema({
  clientFirstName: String,
  clientLastName: String,
  clientEmail: String,
  clientPhoneNumber: Number,
  clientQuery: String,
});

const Query = mongoose.model("Query", querySchema);
