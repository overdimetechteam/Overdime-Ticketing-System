const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: { user: config.email.user, pass: config.email.pass },
    });
  }
  return transporter;
}

async function sendTicketCreated(ticket, user) {
  if (!config.email.user) return;
  await getTransporter().sendMail({
    from: config.email.from,
    to: user.email,
    subject: `Ticket ${ticket.ticketId} Created`,
    html: `
      <h2>Your ticket has been submitted</h2>
      <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
      <p><strong>Title:</strong> ${ticket.title}</p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p>We'll update you as the status changes.</p>
    `,
  });
}

async function sendStatusUpdate(ticket, user, oldStatus) {
  if (!config.email.user) return;
  await getTransporter().sendMail({
    from: config.email.from,
    to: user.email,
    subject: `Ticket ${ticket.ticketId} Status Updated`,
    html: `
      <h2>Your ticket status has changed</h2>
      <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
      <p><strong>Title:</strong> ${ticket.title}</p>
      <p><strong>Previous Status:</strong> ${oldStatus}</p>
      <p><strong>New Status:</strong> ${ticket.status}</p>
    `,
  });
}

async function sendCredentials(user, plainPassword) {
  if (!config.email.user) return;
  await getTransporter().sendMail({
    from: config.email.from,
    to: user.email,
    subject: 'Your Ticketing System Account',
    html: `
      <h2>Welcome to the Ticketing System</h2>
      <p>Your account has been created by an administrator.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Password:</strong> ${plainPassword}</p>
      <p>Please log in and change your password as soon as possible.</p>
    `,
  });
}

module.exports = { sendTicketCreated, sendStatusUpdate, sendCredentials };
