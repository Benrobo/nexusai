import { Route, Routes } from "react-router-dom";
import Home from "@/pages/home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "@styles/global.css";
import PageLayout from "./components/PageLayout";
import Conversations from "./pages/conversations/page";
import Account from "./pages/account/page";
import Messages from "./pages/messages/page";
import DataCtxProvider from "./context/DataCtx";
import RootLayout from "./components/RootLayout";
import Notfound from "./components/Notfound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataCtxProvider>
        <RootLayout>
          <div className="h-screen hideScrollBar2 scroll-smooth bg-white-100">
            <Routes>
              <Route path="/:agent_id" element={<PageLayout />}>
                <Route index element={<Home />} />
                <Route path="conversations" element={<Conversations />} />
                <Route path="account" element={<Account />} />
              </Route>

              <Route path="/:agent_id">
                <Route
                  path="conversation/:conversation_id"
                  element={<Messages />}
                />
              </Route>

              {/* notfound route */}
              <Route path="*" element={<Notfound />} />
            </Routes>
            <Toaster />
          </div>
        </RootLayout>
      </DataCtxProvider>
    </QueryClientProvider>
  );
}

export default App;
