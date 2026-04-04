const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Health Kundali backend running on port ${env.port}`);
});
