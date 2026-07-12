require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`EcoSphere API running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
