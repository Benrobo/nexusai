import App from "./app.js";
import UserRoute from "./routes/user.route.js";
import AuthRoute from "./routes/auth.route.js";
import AgentRoute from "./routes/agents.route.js";
import KnowledgeBaseRoute from "./routes/knowledgebase.route.js";

const server = new App();

server.initializedRoutes([
  new UserRoute(),
  new AuthRoute(),
  new AgentRoute(),
  new KnowledgeBaseRoute(),
]);
server.listen();
