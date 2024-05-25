import App from "./app";
import UserRoute from "./routes/user.route";
import AuthRoute from "./routes/auth.route";
import AgentRoute from "./routes/agents.route";

const server = new App();

server.initializedRoutes([new UserRoute(), new AuthRoute(), new AgentRoute()]);
server.listen();
