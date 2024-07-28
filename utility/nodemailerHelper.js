import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (email) => {
  try {
    const result = await transporter.sendMail(email);
    console.log("Message send", result?.messageId);
  } catch (error) {
    console.log("Email Error", error);
  }
};

export const sendVerificationLinkEmail = (user, verificationUrl) => {
  const { email, firstName, lastName } = user;

  const emailFormat = {
    from: `Ecom Den<${process.env.SMTP_USER}>`,
    to: email,
    subject: "Email Verification For Your Account",
    html: `
    <table style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border-collapse: collapse;">
        <tr>
            <td style="text-align: center;">
                <h1>Account Verification</h1>
            </td>
        </tr>
        <tr>
            <td>
                <p>Dear ${firstName + " " + lastName},</p>
                <p>Thank you for signing up with us. To complete your registration, please click the link below to verify your email address:</p>
                <p><a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">Verify Email</a></p>
                <p>If you did not sign up for an account, please ignore this email.</p>
                <p>Thank you,<br> ECO DEN</p>
            </td>
        </tr>
    </table>
    `,
  };

  sendEmail(emailFormat);
};

export const sendAccountVerifiedEmail = (user, loginUrl) => {
  const { email, firstName, lastName } = user;

  const emailFormat = {
    from: `Eco Den<${process.env.SMTP_USER}>`,
    to: email,
    subject: "Account Verified",
    html: `
    <table style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; border-collapse: collapse;">
        <tr>
            <td style="text-align: center;">
                <h1>Account Verified</h1>
            </td>
        </tr>
        <tr>
            <td>
                <p>Dear ${firstName + " " + lastName},</p>
                <p>Your account has been successfully verified. You can now login to our application using the button below:</p>
                <p><a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">Login Now</a></p>
                <p>If you did not verify your account, please ignore this email.</p>
                <p>Thank you,<br> ECO DEN</p>
            </td>
        </tr>
    </table>
    `,
  };

  sendEmail(emailFormat);
};

export const sendOTP = (otp, email) => {
  const emailFormat = {
    from: `Eco Den<${process.env.SMTP_USER}>`,
    to: email,
    subject: "OTP",
    html: `
  </head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px;">
    <div style="background-color: #007bff; color: #ffffff; padding: 10px 0; text-align: center;">
      <h1 style="margin: 0;">ECOM DEN</h1>
    </div>
    <div style="padding: 20px; text-align: center;">
      <h2 style="margin-top: 0;">Your One-Time Password (OTP)</h2>
      <p style="margin: 20px 0;">Use the following OTP to complete your request. This OTP is valid for the next 10 minutes.</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #007bff;">${otp}</div>
      <p style="margin: 20px 0;">If you did not request this, please ignore this email.</p>
    </div>
    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666666;">
      <p style="margin: 0;">&copy; 2024 ECOM DEN. All rights reserved.</p>
    </div>
  </div>
</body>
    `,
  };

  sendEmail(emailFormat);
};
