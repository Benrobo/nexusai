import { Route, Routes } from "react-router-dom";
import Home from "@/pages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthRootLayout from "./pages/auth/layout";
import AuthPage from "./pages/auth/page";
import useTheme from "./hooks/useTheme";
import { Toaster } from "react-hot-toast";
import DataContextProvider from "./context/DataContext";
import "@styles/global.css";
import Dashboard from "./pages/dashboard";
import DashboardLayout from "./components/dashboard/layout";
import Inbox from "./pages/inbox";
import KnowledgeBase from "./pages/knowledge-base";
import Integration from "./pages/integration";

// tanstack reqct query
const queryClient = new QueryClient();

function App() {
  useTheme();

  return (
    <div className="h-screen hideScrollBar2 scroll-smooth bg-white-100">
      <QueryClientProvider client={queryClient}>
        <DataContextProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<AuthRootLayout />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/integration" element={<Integration />} />
            </Route>
          </Routes>
          <Toaster />
        </DataContextProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
