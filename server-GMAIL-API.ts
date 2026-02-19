// server.ts - FixurDevice Backend with Resend Email API
// Production Ready for Render!

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validate environment variables
if (!process.env.RESEND_API_KEY) {
  console.error('⚠️ WARNING: RESEND_API_KEY is not set!');
  console.error('Please set RESEND_API_KEY in your environment variables.');
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware - Allow all origins for CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  const { name, email, phone, model, issue, adminEmail, userEmail } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !model || !issue) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid email format' 
    });
  }

  const finalAdminEmail = adminEmail || 'fixurdevice.in@gmail.com';
  const finalUserEmail = userEmail || email;

  console.log('[Email] Processing booking for:', { name, phone, model, email });

  try {
    // Send email to Admin (FixurDevice)
    console.log('[Email] Sending admin notification to:', finalAdminEmail);
    
    const { data: emailToAdmin, error: errorToAdmin } = await resend.emails.send({
      from: 'FixurDevice <onboarding@resend.dev>', // Resend test domain
      to: finalAdminEmail,
      replyTo: email, // Customer's email for easy reply
      subject: `📞 New iPhone Repair Booking from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #0a0a0f;
              color: #ffffff;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              border-radius: 20px;
              padding: 40px;
              border: 2px solid #06b6d4;
              box-shadow: 0 10px 40px rgba(6, 182, 212, 0.3);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #06b6d4;
            }
            .logo {
              font-size: 32px;
              font-weight: 900;
              background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #0891b2;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            .field {
              margin: 20px 0;
              padding: 15px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
              border-left: 4px solid #06b6d4;
            }
            .label {
              color: #0891b2;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            .value {
              color: #ffffff;
              font-size: 16px;
              font-weight: 600;
            }
            .message-box {
              background: rgba(6, 182, 212, 0.1);
              border: 2px solid #06b6d4;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #06b6d4;
              color: #0891b2;
              font-size: 12px;
            }
            .badge {
              display: inline-block;
              background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
              color: #ffffff;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FixurDevice</div>
              <div class="subtitle">Premium iPhone Service</div>
            </div>

            <h2 style="color: #06b6d4; text-align: center; margin-bottom: 30px;">
              🔧 New Repair Booking
            </h2>

            <div class="field">
              <div class="label">Customer Name</div>
              <div class="value">${name}</div>
            </div>

            <div class="field">
              <div class="label">Email Address</div>
              <div class="value">${email}</div>
            </div>

            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value">${phone}</div>
            </div>

            <div class="field">
              <div class="label">iPhone Model</div>
              <div class="value">${model}</div>
            </div>

            <div class="message-box">
              <div class="label">Issue Description</div>
              <div class="value" style="margin-top: 10px; line-height: 1.6;">
                ${issue.replace(/\n/g, '<br/>')}
              </div>
            </div>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #15803d; margin-top: 0;">⏱️ Action Required</h3>
              <p style="color: #333;"><strong>Please call this customer within 30 minutes:</strong></p>
              <p style="color: #333; font-size: 18px; background: white; padding: 10px; border-radius: 4px;">
                <a href="tel:${phone}" style="color: #06b6d4; text-decoration: none; font-weight: bold;">${phone}</a>
              </p>
            </div>

            <div class="footer">
              <div style="margin-bottom: 15px;">
                <span class="badge">Same-day Service</span>
                <span class="badge">Genuine Parts</span>
                <span class="badge">6-Month Warranty</span>
              </div>
              <p>This email was sent from FixurDevice booking system</p>
              <p>Reply directly to this email to contact the customer</p>
              <p style="margin-top: 15px;">
                <strong>FixurDevice</strong><br/>
                Bangalore<br/>
                <a href="tel:+919663360775" style="color: #06b6d4; text-decoration: none;">+91 9663360775</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (errorToAdmin) {
      console.error('[Email] Admin email failed:', errorToAdmin);
    } else {
      console.log(`✅ Admin notification sent to ${finalAdminEmail}`);
    }

    // Send auto-reply to customer
    console.log('[Email] Sending confirmation to customer:', finalUserEmail);
    
    const { data: emailToCustomer, error: errorToCustomer } = await resend.emails.send({
      from: 'FixurDevice <onboarding@resend.dev>',
      to: finalUserEmail,
      subject: '✅ Your iPhone Repair Booking Confirmed - FixurDevice',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #0a0a0f;
              color: #ffffff;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              border-radius: 20px;
              padding: 40px;
              border: 2px solid #06b6d4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 36px;
              font-weight: 900;
              background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .content {
              line-height: 1.8;
              color: #D6CCEA;
            }
            .highlight {
              background: rgba(6, 182, 212, 0.2);
              border-left: 4px solid #06b6d4;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #06b6d4;
              color: #0891b2;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FixurDevice</div>
              <p style="color: #0891b2; text-transform: uppercase; letter-spacing: 3px; font-size: 12px;">
                Premium iPhone Service
              </p>
            </div>

            <div class="content">
              <h2 style="color: #06b6d4;">Hi ${name}! 👋</h2>
              
              <p>Thank you for booking with <strong>FixurDevice</strong>!</p>
              
              <div class="highlight">
                <strong>We've received your repair request for:</strong><br/>
                📱 Device: ${model}<br/>
                🔧 Issue: ${issue.substring(0, 50)}${issue.length > 50 ? '...' : ''}
              </div>

              <p><strong>Our manager will call you within 30 minutes</strong> to:</p>
              <ul>
                <li>✓ Confirm your booking</li>
                <li>✓ Provide FREE diagnosis</li>
                <li>✓ Give you a quotation</li>
                <li>✓ Arrange pickup or appointment</li>
              </ul>

              <div style="background: rgba(249, 240, 255, 0.1); border-left: 4px solid #06b6d4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #fbbf24;"><strong>💡 Important:</strong> Keep your phone nearby! Our manager will call you from <strong>+91 9663360775</strong></p>
              </div>

              <p style="margin-top: 30px;">
                <strong>Contact Us:</strong><br/>
                📧 Email: fixurdevice.in@gmail.com<br/>
                📞 Phone: +91 9663360775<br/>
                📍 Location: Bangalore, Karnataka
              </p>
            </div>

            <div class="footer">
              <p>Same-day Service • Genuine Parts • 6-Month Warranty</p>
              <p>© 2024 FixurDevice. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (errorToCustomer) {
      console.log('[Email] Auto-reply failed (non-critical):', errorToCustomer);
    } else {
      console.log(`✅ Customer confirmation sent to ${finalUserEmail}`);
    }

    console.log('[Email] ✅ Booking processed successfully!');

    return res.status(200).json({ 
      success: true, 
      message: `Booking received! Confirmation sent to ${finalUserEmail}` 
    });

  } catch (error: any) {
    console.error('[Email] Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixurDevice Email Server (Resend) is running',
    provider: 'Resend',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FixurDevice Email Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      sendEmail: '/api/send-email (POST)'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n📱 ======================================`);
  console.log(`✅ FixurDevice Email Server is RUNNING!`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📧 Provider: Resend (HTTPS API)`);
  console.log(`📬 Sending to: fixurdevice.in@gmail.com`);
  console.log(`\n📧 Email endpoint: POST http://localhost:${PORT}/api/send-email`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/api/health`);
  console.log(`\n📝 Configuration:`);
  console.log(`   Sending FROM: FixurDevice <onboarding@resend.dev>`);
  console.log(`   Admin notifications to: fixurdevice.in@gmail.com`);
  console.log(`   Customer emails to: Their provided email`);
  console.log(`   Status: ✅ Ready`);
  console.log(`\n📱 ======================================\n`);
});