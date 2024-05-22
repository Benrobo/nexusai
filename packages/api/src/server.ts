import App from "./app";
import UserRoute from "./routes/user.route";
// import OgRoute from "./routes/og.route";
import AuthRoute from "./routes/auth.route";
// import SubscriptionRoute from "./routes/subscription.route";
// import WebhookRoute from "./routes/webhook.route";

const server = new App();

server.initializedRoutes([
    new UserRoute(),
  //   new OgRoute(),
  new AuthRoute(),
  //   new SubscriptionRoute(),
  //   new WebhookRoute(),
]);
server.listen();
