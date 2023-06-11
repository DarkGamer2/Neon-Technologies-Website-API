import express from "express";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import path from "path";
import cors from "cors";
const app = express();
const contactRoutes = require("./routes/contactRoutes");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/neon_tech", contactRoutes);

app.get("/api", (req: Request, res: Response) => {
  res.send("API is Working");
});
dotenv.config();

app.listen(process.env.PORT);
