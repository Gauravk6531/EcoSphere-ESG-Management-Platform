const { Notification } = require("../models");
const { getConfig } = require("./configService");

async function notify(employee_id, type, message, gateField) {
  const config = await getConfig();
  if (gateField && config[gateField] === false) return null;
  return Notification.create({ employee_id, type, message });
}

module.exports = { notify };
