// Vercel Serverless Function: Contact Form Handler
// Receives contact form submissions, stores in Firestore, and sends email notifications

const nodemailer = require('nodemailer');

// Firebase Admin SDK (lightweight — using REST API instead to avoid heavy dependency)
// We'll use the Firebase Web SDK approach via REST API for Firestore writes

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, company, service_needed, meeting_date, meeting_time, timezone, message, hp_field } = req.body;

        // Honeypot spam check
        if (hp_field) {
            return res.status(200).json({ success: true });
        }

        // Validation
        if (!name || !email || !message || !timezone) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }

        // Store in Firestore via REST API
        const projectId = 'portfolio-dab96';
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/contact_submissions`;

        const firestoreBody = {
            fields: {
                name: { stringValue: name },
                email: { stringValue: email },
                company: { stringValue: company || '' },
                service_needed: { stringValue: service_needed || '' },
                meeting_date: { stringValue: meeting_date || '' },
                meeting_time: { stringValue: meeting_time || '' },
                timezone: { stringValue: timezone || '' },
                message: { stringValue: message },
                status: { stringValue: 'New' },
                submitted_at: { timestampValue: new Date().toISOString() }
            }
        };

        const firestoreRes = await fetch(firestoreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(firestoreBody)
        });

        if (!firestoreRes.ok) {
            console.error('Firestore write failed:', await firestoreRes.text());
        }

        // Send email notifications (if SMTP is configured)
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const adminEmail = process.env.ADMIN_EMAIL || 'izaanshakilus@gmail.com';

        if (smtpHost && smtpUser && smtpPass) {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort) || 587,
                secure: (smtpPort === '465'),
                auth: { user: smtpUser, pass: smtpPass }
            });

            // Build meeting info
            let meetingInfo = '';
            if (meeting_date && meeting_time) {
                meetingInfo = `<p><strong>📅 Meeting Requested:</strong> ${meeting_date} at ${meeting_time} (${timezone})</p>`;
            }

            // Email to admin
            await transporter.sendMail({
                from: `"IZAN Portfolio" <${smtpUser}>`,
                to: adminEmail,
                subject: `🔔 New Contact: ${name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; color: #e0e0e0; padding: 30px; border-radius: 12px;">
                        <h2 style="color: #00e5ff;">New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
                        ${service_needed ? `<p><strong>Service:</strong> ${service_needed}</p>` : ''}
                        ${meetingInfo}
                        <p><strong>Message:</strong></p>
                        <p style="background: #1a1a2e; padding: 15px; border-radius: 8px; border-left: 3px solid #00e5ff;">${message}</p>
                    </div>
                `
            });

            // Confirmation email to user
            await transporter.sendMail({
                from: `"Izaan Shakil" <${smtpUser}>`,
                to: email,
                subject: `Thank you for reaching out, ${name}!`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; color: #e0e0e0; padding: 30px; border-radius: 12px;">
                        <h2 style="color: #00e5ff;">Thank You, ${name}!</h2>
                        <p>I've received your message and will get back to you within 24 hours.</p>
                        ${meetingInfo ? `<p>Your meeting request has been noted. I'll confirm the time slot shortly.</p>` : ''}
                        <p style="color: #999; margin-top: 20px;">Best regards,<br/>Izaan Shakil</p>
                    </div>
                `
            });
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};
