const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../config');

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await axios.post(`${config.workhub.baseUrl}/api/auth/token`, {
    email: config.workhub.username,
    password: config.workhub.password,
    client_id: config.workhub.clientId,
    client_secret: config.workhub.clientSecret,
  });

  cachedToken = res.data.access_token || res.data.token;
  // Cache for 10 minutes (token expires in 720 seconds / 12 minutes)
  tokenExpiry = Date.now() + 10 * 60 * 1000;
  return cachedToken;
}

function buildHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function fmtDate(d) {
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

async function createCard(ticket, user) {
  const token = await getToken();
  const { tenantId, workflowId, baseUrl } = config.workhub;

  const priorityLabel = ticket.priority
    ? ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()
    : 'Medium';

  const fields = {
    title:         ticket.ticketId,
    ticketTitle:   ticket.title,
    requestedby:   user.name,
    email:         user.email,
    email1:        user.email,
    company:       ticket.company || '',
    contactNumber: ticket.contactNumber || '',
    datetime:      fmtDate(ticket.createdAt),
    severity:      ticket.severity || '',
    application:   ticket.application || '',
    untitled:      ticket.description,
    ticketStatus:  'Open',
    priority:      ticket.priority || '',
  };

  const attachments = ticket.attachments || [];
  let payload, headers;

  if (attachments.length > 0) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, String(value ?? ''));
    }
    const uploadDir = path.resolve(config.upload.dir);
    for (const attachment of attachments) {
      const filePath = path.join(uploadDir, attachment.storedAs);
      if (!fs.existsSync(filePath)) {
        console.warn(`[Workhub24] Attachment file not found, skipping: ${filePath}`);
        continue;
      }
      console.log(`[Workhub24] Attaching file: ${attachment.filename} (${attachment.mimetype}) from ${filePath}`);
      form.append('attachments', fs.createReadStream(filePath), {
        filename: attachment.filename,
        contentType: attachment.mimetype,
      });
    }
    payload = form;
    headers = { Authorization: `Bearer ${token}`, ...form.getHeaders() };
  } else {
    payload = fields;
    headers = buildHeaders(token);
  }

  console.log(`[Workhub24] createCard → POST ${baseUrl}/api/workflows/${tenantId}/${workflowId}/cards (attachments: ${attachments.length})`);

  try {
    const res = await axios.post(
      `${baseUrl}/api/workflows/${tenantId}/${workflowId}/cards`,
      payload,
      { headers }
    );
    console.log('[Workhub24] createCard success:', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.error('[Workhub24] createCard error:', err.response?.status, JSON.stringify(err.response?.data), err.message);
    throw err;
  }
}

async function updateCard(workhubCardId, updates) {
  const token = await getToken();
  const { tenantId, workflowId, baseUrl } = config.workhub;

  const res = await axios.put(
    `${baseUrl}/api/workflows/${tenantId}/${workflowId}/cards/${workhubCardId}`,
    updates,
    { headers: buildHeaders(token) }
  );

  return res.data;
}

async function getCard(workhubCardId) {
  const token = await getToken();
  const { tenantId, workflowId, baseUrl } = config.workhub;

  const res = await axios.get(
    `${baseUrl}/api/workflows/${tenantId}/${workflowId}/cards/${workhubCardId}`,
    { headers: buildHeaders(token) }
  );

  return res.data;
}

async function listCards() {
  const token = await getToken();
  const { tenantId, workflowId, baseUrl } = config.workhub;

  try {
    const res = await axios.post(
      `${baseUrl}/api/workflows/${tenantId}/${workflowId}/cards/list`,
      {
        fields: ['id', 'title', 'stageId', 'lastUpdatedDate', 'ticketStatus'],
        filters: JSON.stringify([
          { type: 'field', value: 'deleted' },
          { type: 'operator', value: 'IS_EQUAL_TO' },
          { type: 'boolean', value: false },
        ]),
        limit: 100,
        offset: 0,
        orderBy: 'lastUpdatedDate DESC',
        showArchived: false,
      },
      { headers: buildHeaders(token) }
    );
    const data = res.data;
    // Log first card so we can see the actual field names Workhub24 returns
    const sample = Array.isArray(data) ? data[0] : (data?.data?.[0] || data?.cards?.[0]);
    if (sample) console.log('[Workhub24] listCards sample card:', JSON.stringify(sample));
    return data;
  } catch (err) {
    const detail = err.response?.data;
    console.error('listCards failed:', err.response?.status, JSON.stringify(detail));
    throw err;
  }
}

// Map Workhub24 stageId or ticketStatus value to our TicketStatus enum.
// Accepts both stage IDs (draft/inprogress/done/closed) and
// ticketStatus field values (open/inprogress/resolved/closed).
function mapWorkhubStatus(value) {
  if (!value) return null;
  const s = value.toLowerCase().replace(/[\s_-]/g, '');
  if (s === 'draft' || s === 'open' || s === 'new') return 'OPEN';
  if (s === 'inprogress' || s === 'progress' || s === 'active') return 'IN_PROGRESS';
  if (s === 'done' || s === 'resolved' || s === 'complete' || s === 'completed') return 'RESOLVED';
  if (s === 'closed' || s === 'cancelled' || s === 'canceled') return 'CLOSED';
  return null;
}

// Map our TicketStatus to Workhub24 stageId
function mapToWorkhubStage(ticketStatus) {
  const map = {
    OPEN: 'draft',
    IN_PROGRESS: 'inprogress',
    RESOLVED: 'done',
    CLOSED: 'closed',
  };
  return map[ticketStatus] || null;
}

module.exports = { createCard, updateCard, getCard, listCards, mapWorkhubStatus, mapToWorkhubStage };
