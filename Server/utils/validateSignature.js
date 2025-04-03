const crypto = require("crypto");

const validateSignature = (body, signature) => {
  const hash = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(JSON.stringify(body))
    .digest("base64");
  return hash === signature;
};

module.exports = validateSignature;
