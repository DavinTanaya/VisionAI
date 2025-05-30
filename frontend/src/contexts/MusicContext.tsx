// MusicContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface Track {
  id: number;
  type: "youtube" | "audio";
  title: string;
  url?: string;
  videoId?: string;
}

interface MusicContextType {
  musicList: Track[];
  addMusic: (title: string, url: string) => Promise<void>;
  updateMusic: (
    id: number,
    updatedData: { title?: string; url?: string }
  ) => Promise<void>;
  deleteMusic: (id: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const getYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i
  );
  return match ? match[1] : null;
};

const getToken = (): string | null => localStorage.getItem("token");

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [musicList, setMusicList] = useState<Track[]>([]);

  useEffect(() => {
    if (user) fetchMusic();
  }, [user]);

  const fetchMusic = async () => {
    const token = getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch("http://localhost:8000/api/music", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const json = await res.json();
    const list =
      Array.isArray(json.data) && Array.isArray(json.data[0])
        ? json.data[0]
        : [];

    const tracks: Track[] = list.map(
      (item: { id: number; title: string; url: string }) => {
        const videoId = getYouTubeId(item.url);
        return videoId
          ? { id: item.id, type: "youtube", title: item.title, videoId }
          : { id: item.id, type: "audio", title: item.title, url: item.url };
      }
    );

    setMusicList(tracks);
  };

  const addMusic = async (title: string, url: string) => {
    const token = getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch("http://localhost:8000/api/music", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, url }),
    });
    if (!res.ok) throw new Error(`Add failed: ${res.status}`);

    // backend tidak return data baru, jadi panggil ulang
    await fetchMusic();
  };

  const updateMusic = async (
    id: number,
    updatedData: { title?: string; url?: string }
  ) => {
    const token = getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch(`http://localhost:8000/api/music/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);

    // sesuai backend yang hanya return status saja
    await fetchMusic();
  };

  const deleteMusic = async (id: number) => {
    const token = getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch(`http://localhost:8000/api/music/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

    // reload list
    await fetchMusic();
  };

  return (
    <MusicContext.Provider
      value={{ musicList, addMusic, updateMusic, deleteMusic }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be within MusicProvider");
  return ctx;
};
