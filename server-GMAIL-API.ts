// server.ts - FixurDevice Backend with Resend API
// ONLY SENDS TO ADMIN - No customer emails
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

  const finalAdminEmail = adminEmail || 'levloxtech@gmail.com';

  console.log('[Email] New Booking Received:');
  console.log('  Name:', name);
  console.log('  Email:', email);
  console.log('  Phone:', phone);
  console.log('  Model:', model);
  console.log('  Issue:', issue);

  try {
    // ONLY send to admin (verified email)
    console.log('[Email] Sending admin notification to:', finalAdminEmail);
    
    const { data: emailToAdmin, error: errorToAdmin } = await resend.emails.send({
      from: 'FixurDevice <onboarding@resend.dev>',
      to: finalAdminEmail,
      replyTo: email, // Customer's email for easy reply
      subject: `📱 NEW LEAD: ${name} - ${model} Repair Request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .content {
              padding: 40px;
            }
            .alert {
              background: #fff3cd;
              border-left: 5px solid #ffc107;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
              font-weight: 500;
              color: #856404;
            }
            .field {
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .field:last-of-type {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .label {
              color: #667eea;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              display: block;
              margin-bottom: 8px;
            }
            .value {
              color: #333;
              font-size: 16px;
              font-weight: 500;
            }
            .value a {
              color: #667eea;
              text-decoration: none;
              font-weight: 600;
            }
            .value a:hover {
              text-decoration: underline;
            }
            .issue-box {
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              border-radius: 4px;
              margin-top: 8px;
              line-height: 1.6;
              color: #555;
            }
            .action-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin-top: 30px;
            }
            .action-box h2 {
              margin: 0 0 15px 0;
              font-size: 18px;
            }
            .action-box .phone {
              font-size: 28px;
              font-weight: 700;
              margin: 15px 0;
              letter-spacing: 2px;
            }
            .action-box a {
              display: inline-block;
              background: white;
              color: #667eea;
              padding: 12px 30px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 10px 5px;
              transition: transform 0.2s;
            }
            .action-box a:hover {
              transform: scale(1.05);
            }
            .footer {
              background: #f8f9fa;
              padding: 25px 40px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .footer p {
              margin: 5px 0;
            }
            .badge {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              margin: 0 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📱 NEW REPAIR LEAD</h1>
              <p>Customer booking received - Action required!</p>
            </div>

            <div class="content">
              <div class="alert">
                ⚡ <strong>High Priority:</strong> Customer is waiting for your call!
              </div>

              <div class="field">
                <span class="label">Customer Name</span>
                <div class="value">${name}</div>
              </div>

              <div class="field">
                <span class="label">📧 Email Address</span>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>

              <div class="field">
                <span class="label">📞 Phone Number</span>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>

              <div class="field">
                <span class="label">📱 Device Model</span>
                <div class="value">${model}</div>
              </div>

              <div class="field">
                <span class="label">🔧 Issue Description</span>
                <div class="issue-box">${issue.replace(/\n/g, '<br>')}</div>
              </div>

              <div class="action-box">
                <h2>⏱️ NEXT STEPS</h2>
                <p>Call this customer as soon as possible!</p>
                <div class="phone"><a href="tel:${phone}">${phone}</a></div>
                <p style="margin-bottom: 15px; font-size: 13px;">
                  Or reply to this email to contact them
                </p>
                <a href="tel:${phone}">📞 Call Now</a>
                <a href="mailto:${email}">📧 Email Reply</a>
              </div>
            </div>

            <div class="footer">
              <p><strong>FixurDevice Booking System</strong></p>
              <p>
                <span class="badge">Same Day Service</span>
                <span class="badge">Genuine Parts</span>
                <span class="badge">6 Month Warranty</span>
              </p>
              <p style="margin-top: 15px; color: #999;">
                This is an automated email from FixurDevice. Customer information is secure and confidential.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (errorToAdmin) {
      console.error('[Email] ❌ Failed to send admin notification:', errorToAdmin);
      throw errorToAdmin;
    }

    console.log('[Email] ✅ Admin notification sent successfully');
    console.log('[Email] ✅ Booking processed - Admin will contact customer');

    return res.status(200).json({ 
      success: true, 
      message: 'Booking received! Our team will contact you shortly.' 
    });

  } catch (error: any) {
    console.error('[Email] ❌ Server error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process booking. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixurDevice Email Server is running',
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
  console.log(`📬 Admin Notifications: levloxtech@gmail.com`);
  console.log(`\n📊 MODE: ADMIN ONLY (No customer emails)`);
  console.log(`\n📝 Features:`);
  console.log(`   ✓ Admin gets all booking notifications`);
  console.log(`   ✓ Easy reply to customer email`);
  console.log(`   ✓ Click-to-call functionality`);
  console.log(`   ✓ Beautiful email template`);
  console.log(`   ✓ Professional lead management`);
  console.log(`\n📱 ======================================\n`);
});