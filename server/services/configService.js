const { ESGConfig } = require("../models");

async function getConfig() {
  return ESGConfig.findOneAndUpdate(
    { singleton: "main" },
    { $setOnInsert: { singleton: "main" } },
    { upsert: true, new: true }
  );
}

module.exports = { getConfig };
