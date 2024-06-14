import App from "./app.js";
import UserRoute from "./routes/user.route.js";
import AuthRoute from "./routes/auth.route.js";
import AgentRoute from "./routes/agents.route.js";
import KnowledgeBaseRoute from "./routes/knowledgebase.route.js";
import WebhookRoute from "./routes/webhook.route.js";

const server = new App();

server.initializedRoutes([
  new UserRoute(),
  new AuthRoute(),
  new AgentRoute(),
  new KnowledgeBaseRoute(),
  new WebhookRoute(),
]);
server.listen();

// Add a space between warning error coming from pdfjs
// for code readability
setTimeout(() => {
  console.log("\n");
}, 100);
