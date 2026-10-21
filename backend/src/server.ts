import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mockPhysios, mockVideos, bookingsStore, assessmentStore } from "./data.js";
import { Booking, AssessmentSubmission } from "./types.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Kinetiq Recovery API backend running smoothly",
    timestamp: new Date().toISOString()
  });
});

// GET /api/physios (with search and specialty filter)
app.get("/api/physios", (req: Request, res: Response) => {
  const { query, specialty } = req.query;
  let result = [...mockPhysios];

  if (query && typeof query === "string") {
    const q = query.toLowerCase();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.clinic.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.specialties.some(s => s.toLowerCase().includes(q))
    );
  }

  if (specialty && typeof specialty === "string" && specialty !== "All") {
    result = result.filter(p => p.specialties.includes(specialty));
  }

  res.json({ data: result, total: result.length });
});

// GET /api/physios/:id
app.get("/api/physios/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const physio = mockPhysios.find(p => p.id === id);

  if (!physio) {
    return res.status(404).json({ error: "Physiotherapist not found" });
  }

  res.json({ data: physio });
});

// GET /api/videos (with search and category filter)
app.get("/api/videos", (req: Request, res: Response) => {
  const { query, category } = req.query;
  let result = [...mockVideos];

  if (query && typeof query === "string") {
    const q = query.toLowerCase();
    result = result.filter(
      v =>
        v.title.toLowerCase().includes(q) ||
        v.doctor.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === "string" && category !== "All") {
    result = result.filter(v => v.category === category);
  }

  res.json({ data: result, total: result.length });
});

// POST /api/bookings
app.post("/api/bookings", (req: Request, res: Response) => {
  const { physioId, physioName, day, slot, patientName, patientEmail } = req.body;

  if (!physioId || !day || !slot) {
    return res.status(400).json({ error: "physioId, day, and slot are required." });
  }

  const newBooking: Booking = {
    id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    physioId,
    physioName: physioName || "Physiotherapist",
    day,
    slot,
    patientName: patientName || "Guest Patient",
    patientEmail: patientEmail || "",
    createdAt: new Date().toISOString()
  };

  bookingsStore.push(newBooking);

  res.status(201).json({
    message: "Booking confirmed successfully",
    data: newBooking
  });
});

// GET /api/bookings
app.get("/api/bookings", (req: Request, res: Response) => {
  res.json({ data: bookingsStore, total: bookingsStore.length });
});

// POST /api/assessments
app.post("/api/assessments", (req: Request, res: Response) => {
  const body = req.body;

  if (!body.fullName || !body.painLocation) {
    return res.status(400).json({ error: "fullName and painLocation are required." });
  }

  const newSubmission: AssessmentSubmission = {
    id: `asm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    fullName: body.fullName,
    age: body.age || "",
    gender: body.gender || "",
    phone: body.phone || "",
    chiefComplaint: body.chiefComplaint || "",
    painLocation: body.painLocation,
    painScale: body.painScale || 5,
    painType: body.painType || "",
    duration: body.duration || "",
    previousTreatments: body.previousTreatments,
    medicalConditions: body.medicalConditions,
    goals: body.goals,
    uploadedReports: body.uploadedReports || [],
    createdAt: new Date().toISOString()
  };

  assessmentStore.push(newSubmission);

  res.status(201).json({
    message: "Assessment submitted successfully",
    data: newSubmission
  });
});

// GET /api/assessments
app.get("/api/assessments", (req: Request, res: Response) => {
  res.json({ data: assessmentStore, total: assessmentStore.length });
});

app.listen(PORT, () => {
  console.log(`🚀 Kinetiq Backend Server running at http://localhost:${PORT}`);
  console.log(`👉 API Health Endpoint: http://localhost:${PORT}/api/health`);
});
