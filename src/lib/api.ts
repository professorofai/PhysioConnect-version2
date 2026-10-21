export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

export interface Physio {
  id: string;
  name: string;
  title: string;
  clinic: string;
  city: string;
  distance: string;
  rating: number;
  reviews: number;
  specialties: string[];
  price: number;
  nextSlot: string;
  bio: string;
  avatar: string;
}

export interface Video {
  id: string;
  title: string;
  doctor: string;
  duration: string;
  views: string;
  category: string;
  thumb: string;
}

export interface Booking {
  id: string;
  physioId: string;
  physioName: string;
  day: string;
  slot: string;
  patientName?: string;
  patientEmail?: string;
  createdAt: string;
}

export interface AssessmentSubmission {
  id?: string;
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  chiefComplaint: string;
  painLocation: string;
  painScale: number;
  painType: string;
  duration: string;
  previousTreatments?: string;
  medicalConditions?: string;
  goals?: string;
  uploadedReports?: string[];
  createdAt?: string;
}

// Client API Helper
export const api = {
  async getPhysios(query?: string, specialty?: string): Promise<Physio[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (specialty && specialty !== "All") params.set("specialty", specialty);

      const res = await fetch(`${API_BASE_URL}/physios?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch physios");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend API not reachable, falling back to local dataset:", err);
      const { physios } = await import("./mock-data");
      return physios.filter(p => {
        const text = `${p.name} ${p.clinic} ${p.city} ${p.specialties.join(" ")}`.toLowerCase();
        if (query && !text.includes(query.toLowerCase())) return false;
        if (specialty && specialty !== "All" && !p.specialties.includes(specialty)) return false;
        return true;
      });
    }
  },

  async getPhysioById(id: string): Promise<Physio | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/physios/${id}`);
      if (!res.ok) throw new Error("Physio not found");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend API not reachable, falling back to local dataset:", err);
      const { physios } = await import("./mock-data");
      return physios.find(p => p.id === id) || null;
    }
  },

  async getVideos(query?: string, category?: string): Promise<Video[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (category && category !== "All") params.set("category", category);

      const res = await fetch(`${API_BASE_URL}/videos?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn("Backend API not reachable, falling back to local dataset:", err);
      const { videos } = await import("./mock-data");
      return videos.filter(v => {
        if (category && category !== "All" && v.category !== category) return false;
        if (query && !`${v.title} ${v.doctor}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      });
    }
  },

  async createBooking(data: {
    physioId: string;
    physioName: string;
    day: string;
    slot: string;
    patientName?: string;
    patientEmail?: string;
  }): Promise<Booking> {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create booking on backend");
    const json = await res.json();
    return json.data;
  },

  async submitAssessment(data: AssessmentSubmission): Promise<AssessmentSubmission> {
    const res = await fetch(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit assessment to backend");
    const json = await res.json();
    return json.data;
  },
};
