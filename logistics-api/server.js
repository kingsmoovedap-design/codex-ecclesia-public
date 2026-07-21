const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory data
let loads = [
  { id: "load-1", reference: "DL-1001", origin: "Los Angeles, CA", destination: "Phoenix, AZ", rate: "$1200", status: "available" }
];

let fleet = [
  { id: "unit-1", name: "Truck 001", type: "Tractor", rate: "$500/day", status: "available" }
];

let driverLoads = {
  "driver-001": [
    { id: "load-1", reference: "DL-1001", origin: "Los Angeles, CA", destination: "Phoenix, AZ", status: "assigned" }
  ]
};

// Bail bonds in-memory store
let bailCases = [];

app.get('/health', (req, res) => {
  res.json({ status: "healthy" });
});

app.get('/loads', (req, res) => {
  res.json(loads);
});

app.get('/drivers/:driverId/loads', (req, res) => {
  const { driverId } = req.params;
  res.json(driverLoads[driverId] || []);
});

app.post('/loads/:loadId/status', (req, res) => {
  const { loadId } = req.params;
  const { status } = req.body;
  loads = loads.map(l => l.id === loadId ? { ...l, status } : l);
  Object.keys(driverLoads).forEach(did => {
    driverLoads[did] = (driverLoads[did] || []).map(l => l.id === loadId ? { ...l, status } : l);
  });
  res.json({ ok: true });
});

app.get('/fleet', (req, res) => {
  res.json(fleet);
});

// Bail intake
app.post('/bail/intake', (req, res) => {
  const {
    defendantName,
    caseNumber,
    facility,
    charge,
    bailAmount,
    contactName,
    contactPhone,
    contactEmail
  } = req.body || {};

  if (!defendantName || !caseNumber || !facility || !bailAmount || !contactName) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const id = "bail-" + (bailCases.length + 1);
  const record = {
    id,
    defendantName,
    caseNumber,
    facility,
    charge,
    bailAmount,
    contactName,
    contactPhone,
    contactEmail,
    status: "intake",
    createdAt: new Date().toISOString()
  };
  bailCases.push(record);

  res.json({
    id,
    message: "Intake received. A bondsman will review this case."
  });
});

// Bail cases list for Omega
app.get('/bail/cases', (req, res) => {
  res.json(bailCases);
});

// Bail status update from Omega
app.post('/bail/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = [
    "intake",
    "under_review",
    "approved",
    "denied",
    "posted",
    "forfeited",
    "released"
  ];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  bailCases = bailCases.map(c => c.id === id ? { ...c, status } : c);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Logistics API running on port', PORT);
});
