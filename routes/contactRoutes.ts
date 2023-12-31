import { Router } from "express";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
const Query = require("../models/Query.ts");
const router = Router();

router.get("/response", (req: Request, res: Response) => {
  res.send("API is working as expected");
});
router.post("/contact", (req: Request, res: Response) => {
  const query = new Query(req.body);
  query.save().then(async () => {
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {},
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
});

module.exports = router;
