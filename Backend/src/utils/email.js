const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    const info = await transporter.sendMail({
      from: `"SaaS App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log(`✅ Email sent successfully to: ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ Email sending failed to: ${to}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Response: ${error.response}`);
    
    // Check for common issues
    if (error.code === 'EAUTH') {
      console.error('   ⚠️  Authentication failed - check EMAIL_USER and EMAIL_PASS in .env');
      console.error('   ⚠️  Make sure EMAIL_PASS is a Gmail App Password, not your regular password');
    }
    
    return { success: false, error: error.message };
  }
};
