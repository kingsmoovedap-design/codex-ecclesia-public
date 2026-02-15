const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const donations = [];
const fmvDeclarations = [];

app.post("/fmv/declaration", (req, res) => {
  const { tokenSymbol, internalFmvUsd, effectiveDate, basis } = req.body;

  const record = {
    id: uuid(),
    tokenSymbol,
    internalFmvUsd,
    effectiveDate,
    basis,
    createdAt: new Date().toISOString()
  };

  fmvDeclarations.push(record);
  return res.json({ ok: true, record });
});

app.post("/donations", (req, res) => {
  const { donorId, assetType, amount, txHash, notes } = req.body;

  const record = {
    id: uuid(),
    donorId,
    assetType,
    amount,
    txHash,
    notes,
    createdAt: new Date().toISOString()
  };

  donations.push(record);
  return res.json({ ok: true, record });
});

app.get("/fmv/declarations", (_req, res) => {
  res.json(fmvDeclarations);
});

app.get("/donations", (_req, res) => {
  res.json(donations);
});

const PORT = process.env.FMV_PORT || 4500;
app.listen(PORT, () => {
  console.log(`FMV + Donation backend running on http://0.0.0.0:${PORT}`);
});