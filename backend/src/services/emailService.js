const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Load email template
const loadTemplate = (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders with data
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key]);
    });
    
    return template;
  } catch (error) {
    console.error('Template load error:', error);
    return null;
  }
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html || options.message
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const html = loadTemplate('welcome', {
    name: user.name,
    email: user.email,
    loginUrl: `${process.env.FRONTEND_URL}/login`
  });

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Car Rental!',
    html: html || `Welcome ${user.name}! Your account has been created successfully.`
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const html = loadTemplate('resetPassword', {
    name: user.name,
    resetUrl: resetUrl
  });

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: html || `Click here to reset your password: ${resetUrl}`
  });
};

// Send reservation approved email
const sendReservationApprovedEmail = async (client, reservation, car) => {
  const html = loadTemplate('reservationApproved', {
    name: client.name,
    carName: `${car.brand} ${car.model}`,
    pickupDate: new Date(reservation.pickupDate).toLocaleDateString(),
    returnDate: new Date(reservation.returnDate).toLocaleDateString(),
    totalPrice: reservation.totalPrice,
    reservationUrl: `${process.env.FRONTEND_URL}/reservations/${reservation._id}`
  });

  return sendEmail({
    to: client.email,
    subject: 'Your Reservation is Approved!',
    html: html || `Your reservation for ${car.brand} ${car.model} has been approved.`
  });
};

// Send reservation rejected email
const sendReservationRejectedEmail = async (client, reservation, car, reason) => {
  const html = loadTemplate('reservationRefused', {
    name: client.name,
    carName: `${car.brand} ${car.model}`,
    pickupDate: new Date(reservation.pickupDate).toLocaleDateString(),
    reason: reason || 'No reason provided'
  });

  return sendEmail({
    to: client.email,
    subject: 'Reservation Update',
    html: html || `Your reservation for ${car.brand} ${car.model} could not be approved. Reason: ${reason}`
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReservationApprovedEmail,
  sendReservationRejectedEmail
};
