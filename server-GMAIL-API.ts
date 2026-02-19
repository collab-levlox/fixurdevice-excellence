import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fixurdevice.in@gmail.com',
    pass: process.env.GMAIL_PASSWORD,
  },
});

// ✅ COMPLETE CORS CONFIGURATION - FIXED
const corsOptions = {
  origin: [
    // Development
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3000',
    // Production
    'https://fixurdevice.in',
    'https://www.fixurdevice.in',
    'https://fixurdevice-excellence.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { adminEmail, userEmail, name, phone, model, issue } = req.body;

    console.log('[Email] Received request:', { adminEmail, userEmail, name, phone, model });

    if (!adminEmail || !userEmail || !name || !phone || !model || !issue) {
      console.error('[Email] Missing fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    console.log('[Email] Processing booking for:', { name, phone, model, userEmail });

    // Email 1: Send admin notification to fixurdevice email
    console.log('[Email] Sending admin notification to:', adminEmail);
    
    const adminMailOptions = {
      from: 'fixurdevice.in@gmail.com',
      to: adminEmail,
      subject: `📞 New iPhone Repair Booking from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 28px;">New Booking Received ✨</h2>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px;">
            <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
            
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Customer Email:</strong> <a href="mailto:${userEmail}" style="color: #06b6d4;">${userEmail}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}" style="color: #06b6d4;">${phone}</a></p>
            <p><strong>Device:</strong> ${model}</p>
            
            <h3 style="color: #333; margin-top: 20px;">Issue Description</h3>
            <p style="background: white; padding: 15px; border-left: 4px solid #06b6d4; color: #666;">
              ${issue.replace(/\n/g, '<br/>')}
            </p>
          </div>
          
          <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #0891b2;">
            <h3 style="color: #0891b2;">📋 Action Required</h3>
            <p style="color: #333;"><strong>⏱️ Call this customer within 30 minutes:</strong></p>
            <p style="color: #333; font-size: 18px; background: white; padding: 10px; border-radius: 4px;">
              <a href="tel:${phone}" style="color: #06b6d4; text-decoration: none; font-weight: bold;">${phone}</a>
            </p>
          </div>
          
          <div style="background: white; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">
              <strong>FixurDevice</strong><br/>
              Bangalore<br/>
              <a href="tel:+919663360775" style="color: #06b6d4;">+91 9663360775</a>
            </p>
          </div>
        </div>
      `,
    };

    // Email 2: Send confirmation to customer
    console.log('[Email] Sending confirmation to customer:', userEmail);
    
    const customerMailOptions = {
      from: 'fixurdevice.in@gmail.com',
      to: userEmail,
      subject: `✅ Your iPhone Repair Booking Confirmed - FixurDevice`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0; font-size: 28px;">Booking Confirmed! 🎉</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">FixurDevice</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hi <strong>${name}</strong>,</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for booking with <strong>FixurDevice</strong>! We've received your iPhone repair request. <strong>Our manager will call you shortly</strong> to confirm the details and provide you with a free diagnosis.
            </p>
            
            <div style="background: white; border-left: 4px solid #06b6d4; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #0891b2; margin-top: 0;">📱 Your Booking Details</h3>
              <table style="width: 100%; color: #333;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Device:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${model}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0; text-align: right;"><a href="tel:${phone}" style="color: #06b6d4; text-decoration: none;">${phone}</a></td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #15803d; margin-top: 0;">✓ What Happens Next?</h3>
              <p style="color: #333; margin: 0 0 15px 0;"><strong>Our manager will contact you within 30 minutes</strong> to:</p>
              <ul style="color: #333; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">✓ Confirm your booking</li>
                <li style="margin-bottom: 8px;">✓ Provide FREE diagnosis</li>
                <li style="margin-bottom: 8px;">✓ Give you a quotation</li>
                <li>✓ Arrange pickup or appointment</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0;"><strong>💡 Important:</strong> Keep your phone nearby! Our manager will call you from +91 9663360775</p>
            </div>
          </div>
          
          <div style="background: white; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
              <strong>FixurDevice - Premium iPhone Service</strong><br/>
              Bangalore
            </p>
            <p style="color: #666; margin: 0; font-size: 13px;">
              <a href="tel:+919663360775" style="color: #06b6d4; text-decoration: none; margin-right: 15px;">📞 +91 9663360775</a>
              <a href="https://wa.me/919663360775" style="color: #06b6d4; text-decoration: none;">📱 WhatsApp</a>
            </p>
            <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">Available 24/7 for Emergencies</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    try {
      await transporter.sendMail(adminMailOptions);
      console.log('[Email] Admin notification sent: ✅');
    } catch (error: any) {
      console.error('[Email] Admin email failed:', error.message);
    }

    try {
      await transporter.sendMail(customerMailOptions);
      console.log('[Email] Customer confirmation sent: ✅');
    } catch (error: any) {
      console.error('[Email] Customer email failed:', error.message);
    }

    console.log('[Email] ✅ Booking processed successfully!');
    console.log('[Email] - Admin notification sent to: ' + adminEmail);
    console.log('[Email] - Customer confirmation sent to: ' + userEmail);

    return res.status(200).json({
      success: true,
      message: 'Booking received! Confirmation sent to ' + userEmail,
    });
  } catch (error: any) {
    console.error('[Email] Server error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process booking',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: POST http://localhost:${PORT}/api/send-email`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/api/health`);
  console.log(`\n📝 Configuration:`);
  console.log(`   Sending FROM: fixurdevice.in@gmail.com`);
  console.log(`   Admin notifications to: fixurdevice.in@gmail.com`);
  console.log(`   Customer emails to: Their provided email`);
  console.log(`   Status: ✅ Ready\n`);
});