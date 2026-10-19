require('dotenv').config();
const axios = require('axios');

const BASE = process.env.WORKHUB_BASE_URL;
const TENANT = process.env.WORKHUB_TENANT_ID;
const WORKFLOW = process.env.WORKHUB_WORKFLOW_ID;
const CLIENT_ID = process.env.WORKHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.WORKHUB_CLIENT_SECRET;
const EMAIL = process.env.WORKHUB_API_USERNAME;
const PASS = process.env.WORKHUB_API_PASSWORD;

async function getToken(payload) {
  const res = await axios.post(`${BASE}/api/auth/token`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data.access_token;
}

async function tryCreate(label, token, payload) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    const res = await axios.post(
      `${BASE}/api/workflows/${TENANT}/${WORKFLOW}/cards`,
      payload,
      { headers }
    );
    console.log(`✓ ${label} — Card created! ID: ${res.data?.id}`);
    console.log('  Response:', JSON.stringify(res.data, null, 2));
    return true;
  } catch (err) {
    console.log(`✗ ${label} — ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    return false;
  }
}

async function main() {
  // Token 1: Regular user + client credentials
  const regularToken = await getToken({
    email: EMAIL, password: PASS,
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
  });
  console.log('Regular user token: OK');

  // Token 2: API client (client_credentials)
  const apiToken = await getToken({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
  });
  console.log('API client token: OK\n');

  const minPayload = { title: 'TKT-00001' };
  const fullPayload = {
    title: 'TKT-00001',
    ticketTitle: 'Test Issue from API',
    requestedby: 'Test User',
    email: 'test@overdimetechnologies.com',
    datetime: new Date().toISOString(),
    severity: 'HIGH',
    affected: 'CRM',
    untitled: 'This is a test ticket raised via the API.',
    ticketStatus: 'OPEN',
  };

  console.log('--- Regular user token, minimal payload ---');
  await tryCreate('regular + minimal', regularToken, minPayload);

  console.log('\n--- Regular user token, full payload ---');
  await tryCreate('regular + full', regularToken, fullPayload);

  console.log('\n--- API client token, minimal payload ---');
  await tryCreate('api client + minimal', apiToken, minPayload);

  console.log('\n--- API client token, full payload ---');
  await tryCreate('api client + full', apiToken, fullPayload);
}

main().catch((err) => console.error('Fatal:', err.response?.data || err.message));
