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
  id: string;
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
  createdAt: string;
}
