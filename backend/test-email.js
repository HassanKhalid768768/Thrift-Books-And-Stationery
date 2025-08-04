require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' : 'NOT SET');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      port: 465,
    });

    // Verify transporter
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully');

    // Send test email
    console.log('Sending test email...');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hassanjack01@gmail.com',
      subject: 'Test Email - Order System',
      text: 'This is a test email to verify the email functionality is working correctly.',
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();
