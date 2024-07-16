import { Route, Routes } from "react-router-dom";
import Home from "@/pages/home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "@styles/global.css";
import PageLayout from "./components/PageLayout";
import Conversations from "./pages/conversations/page";
import Account from "./pages/account/page";
import Messages from "./pages/messages/page";

// tanstack reqct query
const queryClient = new QueryClient();

function App() {
  return (
    <div className="h-screen hideScrollBar2 scroll-smooth bg-white-100">
      <QueryClientProvider client={queryClient}>
        {/* <DataContextProvider> */}
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/account" element={<Account />} />
          </Route>

          <Route path="/conversation/:conversation_id" element={<Messages />} />
        </Routes>
        <Toaster />
        {/* </DataContextProvider> */}
      </QueryClientProvider>
    </div>
  );
}

export default App;
