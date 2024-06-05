import App from "./app";
import UserRoute from "./routes/user.route";
import AuthRoute from "./routes/auth.route";
import AgentRoute from "./routes/agents.route";
import KnowledgeBaseRoute from "./routes/knowledgebase.route";

const server = new App();

server.initializedRoutes([
  new UserRoute(),
  new AuthRoute(),
  new AgentRoute(),
  new KnowledgeBaseRoute(),
]);
server.listen();
