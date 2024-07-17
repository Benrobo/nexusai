const inDev = import.meta.env.DEV;

const env = {
  CLIENT_BASE_URL: inDev ? "http://localhost:3010" : "",
  API_URL: inDev ? "http://localhost:4001/api" : "",
};
export default env;
