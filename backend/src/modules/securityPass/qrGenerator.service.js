const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

async function generatePassCode() {
  return `SP-${uuidv4().split('-')[0].toUpperCase()}`;
}

async function generateQrDataUrl(payload) {
  const content = JSON.stringify(payload);
  return QRCode.toDataURL(content);
}

module.exports = { generatePassCode, generateQrDataUrl };
