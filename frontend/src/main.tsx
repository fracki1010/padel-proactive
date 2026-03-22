import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HeroUIProvider className="dark text-foreground bg-background">
          <ToastProvider
            placement="top-center"
            toastProps={{ variant: "solid" }}
          />
          <App />
        </HeroUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
