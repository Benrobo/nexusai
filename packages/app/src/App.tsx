import { useState } from "react";
import "./styles/global.css";
import "./styles/App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-red-200">welcome </h1>
      <a href="http://localhost:4001/api/auth/google">SignIn with Google.</a>
    </>
  );
}

export default App;
