const nodemailer = require('nodemailer');

// Check if email credentials are configured
const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASS;
};

// Create transporter (only if email is configured)
let transporter = null;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Test connection
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email configuration error:', error.message);
      console.log('⚠️  OTP will be shown in console instead');
      transporter = null;
    } else {
      console.log('✅ Email service configured successfully');
    }
  });
} else {
  console.log('ℹ️  Email not configured. OTP will be shown in console.');
}

// Send OTP Email
const sendOTPEmail = async (to, otp, companyName = 'User') => {
  try {
    // If email is not configured, log to console
    if (!transporter) {
      console.log('\n' + '='.repeat(70));
      console.log('📧 OTP FOR PASSWORD RESET (Console Display)');
      console.log('='.repeat(70));
      console.log(`To: ${to}`);
      console.log(`Company: ${companyName}`);
      console.log(`OTP: ${otp}`);
      console.log(`Time: ${new Date().toLocaleString()}`);
      console.log('='.repeat(70));
      console.log('⚠️  To enable email delivery:');
      console.log('1. Add EMAIL_USER and EMAIL_PASS to .env file');
      console.log('2. Use Gmail App Password (from Google Account > Security)');
      console.log('='.repeat(70) + '\n');
      
      return { 
        success: true, 
        otp: otp,
        mode: 'console',
        message: 'OTP displayed in console'
      };
    }

    // Send real email
    const mailOptions = {
      from: `"PMS System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset OTP - KRA System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Performance Management System</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${companyName},</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              You have requested to reset your password for the KRA Management System.
            </p>
            
            <div style="background: white; padding: 25px; border: 2px dashed #667eea; border-radius: 8px; text-align: center; margin: 25px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">Your One-Time Password (OTP)</h3>
              <div style="font-size: 40px; font-weight: bold; color: #667eea; letter-spacing: 15px; margin: 20px 0; padding: 10px; background: #f0f4ff; border-radius: 5px;">
                ${otp}
              </div>
              <p style="color: #666; margin: 10px 0;">This OTP is valid for 15 minutes</p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-weight: bold;">Important:</p>
              <ul style="color: #856404; margin: 10px 0 0; padding-left: 20px;">
                <li>Do not share this OTP with anyone</li>
                <li>This OTP will expire in 15 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Need help? Contact our support team.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #777; margin: 0;">
                Best regards,<br>
                <strong>PMS System Team</strong>
              </p>
            </div>
          </div>
          <div style="background: #f1f1f1; padding: 15px; text-align: center; color: #777; font-size: 12px;">
            <p style="margin: 0;">
              © ${new Date().getFullYear()} PMS Management System. All rights reserved.<br>
              This is an automated email, please do not reply.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      mode: 'email',
      message: 'OTP sent via email'
    };
    
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    
    // Fallback to console
    console.log('\n' + '='.repeat(70));
    console.log('📧 OTP (Email failed, using console)');
    console.log('='.repeat(70));
    console.log(`To: ${to}`);
    console.log(`OTP: ${otp}`);
    console.log('='.repeat(70) + '\n');
    
    return { 
      success: true, 
      otp: otp,
      mode: 'console-fallback',
      message: 'Email failed, OTP in console',
      error: error.message
    };
  }
};

// Send Welcome Email (for registration)
const sendWelcomeEmail = async (to, companyName) => {
  try {
    // If email is not configured, skip
    if (!transporter) {
      console.log(`ℹ️  Welcome email skipped for ${companyName} (${to})`);
      return { 
        success: true, 
        skipped: true,
        message: 'Email not configured'
      };
    }

    const mailOptions = {
      from: `"PMS System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Welcome to PMS Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Welcome to PMS System!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${companyName},</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Welcome to the PMS Management System! Your account has been successfully created and is now active.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
              <p style="color: #333; margin-bottom: 10px; font-weight: bold;">Your Account Details:</p>
              <ul style="color: #555; margin: 0; padding-left: 20px;">
                <li><strong>Company:</strong> ${companyName}</li>
                <li><strong>Email:</strong> ${to}</li>
                <li><strong>Status:</strong> Active</li>
                <li><strong>Registered:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              You can now login to your account and start managing your Key Result Areas, track employee performance, and generate detailed reports.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Login to Your Account
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #777; margin-bottom: 10px;">Need help getting started?</p>
              <p style="color: #555; margin: 0; line-height: 1.6;">
                Check out our documentation or contact our support team if you have any questions.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #777; margin: 0;">
                Best regards,<br>
                <strong>PMS System Team</strong>
              </p>
            </div>
          </div>
          <div style="background: #f1f1f1; padding: 15px; text-align: center; color: #777; font-size: 12px;">
            <p style="margin: 0;">
              © ${new Date().getFullYear()} PMS Management System. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${to}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Welcome email sent'
    };
    
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return { 
      success: false, 
      error: error.message
    };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  isEmailConfigured
};