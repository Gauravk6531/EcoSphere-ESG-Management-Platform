function sanitizePayload(payload) {
  const output = {};
  for (const [key, value] of Object.entries(payload || {})) {
    output[key] = value === "" ? null : value;
  }
  return output;
}

module.exports = { sanitizePayload };
