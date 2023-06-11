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
app.use(express.static(path.join(__dirname, "./portfolio/dist")));
app.use("/api/neon_tech", contactRoutes);

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "./portfolio/dist/index.html"));
});
dotenv.config();

app.listen(process.env.PORT);
