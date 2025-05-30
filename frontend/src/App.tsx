// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Root";
import PomodoroTimer from "./components/PomodoroTimer";
import MusicPlayer from "./components/MusicPlayer";
import Login from "./components/Login";
import Sessions from "./components/Sessions";
import SessionHistory from "./components/SessionHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import "./App.css";
import PublicRoute from "./components/PublicRoute";

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: "/timer",
        element: (
          <ProtectedRoute>
            <PomodoroTimer />
          </ProtectedRoute>
        ),
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        ),
      },
      {
        path: "/session/:id",
        element: (
          <ProtectedRoute>
            <PomodoroTimer />
          </ProtectedRoute>
        ),
      },
      {
        path: "/music",
        element: (
          <ProtectedRoute>
            <MusicPlayer />
          </ProtectedRoute>
        ),
      },
      {
        path: "/history",
        element: (
          <ProtectedRoute>
            <SessionHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
