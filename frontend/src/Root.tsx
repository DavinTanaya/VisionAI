// src/Root.tsx
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionProvider } from "./contexts/SessionContext";
import Navbar from "./components/Navbar";
import { MusicProvider } from "./contexts/MusicContext";

export default function Root() {
  return (
    <AuthProvider>
      <MusicProvider>
        <SessionProvider>
          <div className="min-h-screen bg-[#f8f0fd]">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Outlet />
            </div>
          </div>
        </SessionProvider>
      </MusicProvider>
    </AuthProvider>
  );
}
