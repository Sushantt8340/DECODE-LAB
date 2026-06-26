/**
 * Email Service
 * Manages sending HTML booking and confirmation emails using Nodemailer
 */

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initializes and retrieves the Nodemailer transporter (SMTP or Ethereal sandbox)
 */
const getTransporter = async () => {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        transporter = nodemailer.createTransport({
            host,
            port,
            secure: Number(port) === 465,
            auth: { user, pass }
        });
        console.log('[Email]: SMTP Transporter successfully configured.');
    } else {
        // Fallback to Ethereal sandbox test account
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            transporter.isDemo = true;
            transporter.demoUser = testAccount.user;
            console.log(`[Email]: Created Ethereal test account: ${testAccount.user}. Email notifications will output sandbox links.`);
        } catch (err) {
            console.error('[Email]: Failed to initialize Ethereal sandbox. Falling back to Log-Only mode.', err);
            transporter = {
                sendMail: async (options) => {
                    console.log('\n[Email Sandbox Log]: Simulating Email dispatch:\n', JSON.stringify(options, null, 2));
                    return { messageId: `mock_log_${Date.now()}` };
                }
            };
        }
    }
    return transporter;
};

/**
 * Helper to log and display Ethereal sandbox links in development/demo mode
 */
const logMailResult = (info, clientTransporter) => {
    if (clientTransporter.isDemo && info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`\n==================================================`);
        console.log(`✉️  [Email Sandbox]: Email successfully sent!`);
        console.log(`🔗 View Email Preview in Browser: ${previewUrl}`);
        console.log(`==================================================\n`);
    } else {
        console.log(`[Email]: Message sent successfully. ID: ${info.messageId}`);
    }
};

/**
 * Base HTML template for BharatSafar emails
 */
const getHtmlWrapper = (title, headerText, contentHtml) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 20px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb; }
            .header { background: linear-gradient(135deg, #ff7e5f, #feb47b); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .body { padding: 30px; line-height: 1.6; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #fafafa; border-radius: 8px; overflow: hidden; }
            .details-table td { padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-size: 14px; }
            .details-table td.label { font-weight: 600; color: #4b5563; width: 40%; }
            .details-table td.value { color: #111827; }
            .badge { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; }
            .badge-paid { background-color: #d1fae5; color: #065f46; }
            .badge-callback { background-color: #fef3c7; color: #d97706; }
            .badge-pending { background-color: #fee2e2; color: #991b1b; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            .btn { display: inline-block; background-color: #ff7e5f; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>${headerText}</h1>
            </div>
            <div class="body">
                ${contentHtml}
            </div>
            <div class="footer">
                <p>This is an automated booking system notification. Please do not reply directly to this email.</p>
                <p>&copy; ${new Date().getFullYear()} BharatSafar. Travel Explorer & Booking Platform.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Sends booking request placement email to customer
 */
const sendBookingConfirmation = async (booking) => {
    try {
        const clientTransporter = await getTransporter();
        
        let subject = `BharatSafar: Booking Request Placed - ${booking.destination}`;
        let headerText = "Booking Request Placed! ✈️";
        let statusBadgeClass = "badge-pending";
        let statusText = "Pending Payment";
        
        let customMessage = `Thank you for choosing BharatSafar! We have received your booking details for <strong>${booking.destination}</strong>.`;

        if (booking.paymentOption === 'pay_callback') {
            subject = `BharatSafar: Callback Scheduled - ${booking.destination}`;
            headerText = "Callback Scheduled! 📞";
            statusBadgeClass = "badge-callback";
            statusText = "Callback Requested";
            customMessage = `Thank you for your inquiry! A dedicated travel expert will call you at <strong>${booking.phone}</strong> within 24 hours to finalize your itinerary and secure payment.`;
        } else if (booking.paymentStatus === 'paid') {
            subject = `BharatSafar: Trip Confirmed! 🎉 - ${booking.destination}`;
            headerText = "Trip Confirmed! 🎉";
            statusBadgeClass = "badge-paid";
            statusText = "Paid & Confirmed";
            customMessage = `Congratulations! Your payment of <strong>₹${booking.totalPrice.toLocaleString('en-IN')}</strong> has been received and verified. Your trip to <strong>${booking.destination}</strong> is fully confirmed.`;
        }

        const dateStr = new Date(booking.travelDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const content = `
            <p>Dear ${booking.fullName},</p>
            <p>${customMessage}</p>
            
            <h3 style="margin-top: 25px; font-size: 16px; border-bottom: 2px solid #ff7e5f; padding-bottom: 5px;">Trip & Invoice Summary</h3>
            <table class="details-table">
                <tr>
                    <td class="label">Booking ID</td>
                    <td class="value" style="font-family: monospace;">${booking.id}</td>
                </tr>
                <tr>
                    <td class="label">Destination</td>
                    <td class="value"><strong>${booking.destination}</strong></td>
                </tr>
                <tr>
                    <td class="label">Travel Date</td>
                    <td class="value">${dateStr}</td>
                </tr>
                <tr>
                    <td class="label">Guests</td>
                    <td class="value">${booking.adults} Adults, ${booking.kids} Kids</td>
                </tr>
                <tr>
                    <td class="label">Package Type</td>
                    <td class="value" style="text-transform: capitalize;">${booking.packageType}</td>
                </tr>
                <tr>
                    <td class="label">Total Price</td>
                    <td class="value" style="font-weight: bold; color: #ff7e5f; font-size: 16px;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="label">Status</td>
                    <td class="value"><span class="badge ${statusBadgeClass}">${statusText}</span></td>
                </tr>
            </table>
            
            <p style="margin-top: 20px;">If you have any questions or would like to make modifications, please visit your Customer Dashboard or call our 24/7 hotline.</p>
            <div style="text-align: center;">
                <a href="http://localhost:5000" class="btn">Go to Dashboard</a>
            </div>
        `;

        const mailOptions = {
            from: `"BharatSafar Support" <noreply@bharatsafar.com>`,
            to: booking.email,
            subject: subject,
            html: getHtmlWrapper(subject, headerText, content)
        };

        const info = await clientTransporter.sendMail(mailOptions);
        logMailResult(info, clientTransporter);
        return info;
    } catch (err) {
        console.error('[Email]: Failed to send booking confirmation email:', err);
    }
};

/**
 * Sends admin verification confirmation email to customer
 */
const sendAdminConfirmation = async (booking) => {
    try {
        const clientTransporter = await getTransporter();
        
        const subject = `BharatSafar: Booking Confirmed! 🎉 - ${booking.destination}`;
        const headerText = "Trip Booking Confirmed! 🎉";
        const dateStr = new Date(booking.travelDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const content = `
            <p>Dear ${booking.fullName},</p>
            <p>Fantastic news! Our travel consultant has verified your details and confirmed your booking request for <strong>${booking.destination}</strong> on <strong>${dateStr}</strong>.</p>
            <p>Your payment status has been updated to <strong>Paid</strong>.</p>
            
            <h3 style="margin-top: 25px; font-size: 16px; border-bottom: 2px solid #ff7e5f; padding-bottom: 5px;">Updated Booking Details</h3>
            <table class="details-table">
                <tr>
                    <td class="label">Booking ID</td>
                    <td class="value" style="font-family: monospace;">${booking.id}</td>
                </tr>
                <tr>
                    <td class="label">Destination</td>
                    <td class="value"><strong>${booking.destination}</strong></td>
                </tr>
                <tr>
                    <td class="label">Travel Date</td>
                    <td class="value">${dateStr}</td>
                </tr>
                <tr>
                    <td class="label">Package Details</td>
                    <td class="value" style="text-transform: capitalize;">${booking.packageType} Package (${booking.adults} Adults, ${booking.kids} Kids)</td>
                </tr>
                <tr>
                    <td class="label">Amount Paid</td>
                    <td class="value" style="font-weight: bold; color: #ff7e5f; font-size: 16px;">₹${booking.totalPrice.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="label">Status</td>
                    <td class="value"><span class="badge badge-paid">Paid & Confirmed</span></td>
                </tr>
            </table>

            <p>We are excited to host you. Your digital tickets, packing guide, and itinerary schedule will be generated shortly and available for download in your travel portal.</p>
            
            <div style="text-align: center;">
                <a href="http://localhost:5000" class="btn">View in Portal</a>
            </div>
        `;

        const mailOptions = {
            from: `"BharatSafar Support" <noreply@bharatsafar.com>`,
            to: booking.email,
            subject: subject,
            html: getHtmlWrapper(subject, headerText, content)
        };

        const info = await clientTransporter.sendMail(mailOptions);
        logMailResult(info, clientTransporter);
        return info;
    } catch (err) {
        console.error('[Email]: Failed to send admin confirmation email:', err);
    }
};

module.exports = {
    sendBookingConfirmation,
    sendAdminConfirmation
};
