const nodemailer = require('nodemailer');

// @desc    Book a service with cycle details and attachment
// @route   POST /api/bookings
// @access  Public
exports.createServiceBooking = async (req, res) => {
  const { name, email, phone, brand, model, date, message } = req.body;

  // Validation
  if (!name || !email || !phone || !brand || !model || !date || !message) {
    return res.status(400).json({ message: 'All fields except image are required' });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Setup attachments
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype,
      });
    }

    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: 'hello@shiftbikes.com',
      replyTo: email,
      subject: `New Service Booking Request: ${brand} ${model} from ${name}`,
      text: `
You have received a new service booking request:

Name: ${name}
Email: ${email}
Phone: ${phone}
Cycle Brand: ${brand}
Cycle Model: ${model}
Preferred Date: ${date}
Details/Issues:
${message}

Attachment: ${req.file ? req.file.originalname : 'No image attached'}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #ff3366; border-bottom: 2px solid #ff3366; padding-bottom: 10px; margin-top: 0;">New Service Booking Request</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Phone:</td>
              <td style="padding: 8px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Cycle Brand:</td>
              <td style="padding: 8px;">${brand}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Cycle Model:</td>
              <td style="padding: 8px;">${model}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Preferred Date:</td>
              <td style="padding: 8px;">${date}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #ff3366; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Service/Issue Details:</h4>
            <p style="margin: 0; line-height: 1.6; color: #555; white-space: pre-wrap;">${message}</p>
          </div>
          ${req.file ? `<p style="margin-top: 20px; font-size: 13px; color: #888;">📎 An image of the cycle (${req.file.originalname}) has been attached to this email.</p>` : ''}
        </div>
      `,
      attachments,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Service booking request sent successfully!' });
  } catch (error) {
    console.error('Error sending service booking email:', error);
    res.status(500).json({ message: 'Failed to submit service booking. Please try again later.' });
  }
};
