import * as nodemailer from "nodemailer";
const Handlebars = require("handlebars");
const Path = require("path");
const Constants = require("./constants");
const fs = require("fs");

async function renderMessageFromTemplate(templateDate: any, variableData: any) {
  const compiledFile = await Handlebars.compile(templateDate)(variableData);
  return Promise.resolve(compiledFile);
}

export async function sendEmail(email: string, url: string) {
  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass, // generated ethereal password
    },
  });

  const mailOptions = {
    from: "<finaxis@corporation.com>", // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: `<a href="${url}">${url}</a>`, // html body
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId, info);
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export async function sendEmail1(
  emailId?: string,
  emailType?: string,
  emailVarialbles?: any,
  subject?: string
) {
  try {
    const account = await nodemailer.createTestAccount();
    const mailOptions: any = {
      from: account.user,
      to: emailId,
      subject: subject,
      html: null,
    };
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass, // generated ethereal password
      },
    });
    let filePath;

    let emailMessage;
    switch (emailType) {
      case "FORGOTPASSWORD":
        filePath = Path.normalize(
          Path.join(
            Path.resolve("./src"),
            Constants.email.FORGOTPASSWORD.emailMessage
          )
        );
        emailMessage = await fs.readFileSync(filePath, "utf8");
        mailOptions.subject = Constants.email.FORGOTPASSWORD.emailSubject;
        mailOptions.html = await renderMessageFromTemplate(
          emailMessage,
          emailVarialbles
        );
        break;
      default:
        console.log("error");
        return Promise.reject(new Error("Something went wrong with emailer"));
    }

    const sentMail = await transporter.sendMail(mailOptions);
    console.log("Email sent to:", sentMail);
    console.log("Message sent: %s", sentMail.messageId, sentMail);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(sentMail));

    return Promise.resolve({ status: "sent", data: sentMail });
  } catch (error) {
    return Promise.resolve({ status: "error", data: error });
  }
}
