import App from "./app";
import UserRoute from "./routes/user.route";
import AuthRoute from "./routes/auth.route";
import WorkspaceRoute from "./routes/workspace.route";

const server = new App();

server.initializedRoutes([
  new UserRoute(),
  new WorkspaceRoute(),
  new AuthRoute(),
]);
server.listen();
