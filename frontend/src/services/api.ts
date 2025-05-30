import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const getToken = (): string | null => localStorage.getItem("token");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export type Session = {
  id?: number;
  name?: string;
  focus: number;
  break: number;
  repeat: number;
  yawning?: number;
  closed?: number;
  done: number;
  runtime?: number;
  userId?: number;
  created_at?: string;
  updated_at?: string;
};

const SessionApi = {
  getSessions: async (): Promise<Session[]> => {
    try {
      const response = await api.get("/session");
      return response.data.data[0] || [];
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  },
  getSessionById: async (id: number): Promise<Session | null> => {
    try {
      const response = await api.get(`/session/${id}`);
      const arr = response.data.data as Session[];
      return arr.length > 0 ? arr[0] : null;
    } catch (error) {
      console.error("Error fetching session by id:", error);
      return null;
    }
  },
  createSession: async (session: Session): Promise<Session | undefined> => {
    try {
      const response = await api.post("/session", session);
      return response.data.data;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  },
  updateSession: async (
    id: number,
    session: Partial<Session>
  ): Promise<void> => {
    try {
      await api.patch(`/session/${id}`, session);
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  },
  incrementRuntime: async (id: number): Promise<void> => {
    try {
      await api.get(`/session/${id}/runtime`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 403) {
        console.error("Error incrementing runtime:", error);
      }
    }
  },
  incrementYawning: async (id: number): Promise<void> => {
    try {
      await api.get(`/session/${id}/yawning`);
    } catch (error) {
      console.error("Error incrementing yawning count:", error);
    }
  },
  incrementClosed: async (id: number): Promise<void> => {
    try {
      await api.get(`/session/${id}/closed`);
    } catch (error) {
      console.error("Error incrementing closed eyes count:", error);
    }
  },
  incrementDone: async (id: number): Promise<void> => {
    try {
      await api.get(`/session/${id}/done`);
    } catch (error) {
      console.error("Error incrementing completed session count:", error);
    }
  },
};

export default SessionApi;
