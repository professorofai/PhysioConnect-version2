export type Physio = {
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
};

export const physios: Physio[] = [
  {
    id: "dr-anika-rao",
    name: "Dr. Anika Rao",
    title: "DPT, OCS",
    clinic: "Meridian Sports Rehab",
    city: "Bengaluru, Indiranagar",
    distance: "1.2 km",
    rating: 4.9,
    reviews: 284,
    specialties: ["Sports Injury", "ACL Recovery", "Manual Therapy"],
    price: 900,
    nextSlot: "Today · 4:30 PM",
    bio: "10+ years working with athletes on return-to-play protocols and post-op ACL rehab.",
    avatar: "AR",
  },
  {
    id: "dr-vikram-shah",
    name: "Dr. Vikram Shah",
    title: "MPT, Neuro",
    clinic: "Northline Neuro Physio",
    city: "Bengaluru, Koramangala",
    distance: "2.4 km",
    rating: 4.8,
    reviews: 191,
    specialties: ["Stroke Recovery", "Parkinson's", "Gait Training"],
    price: 1100,
    nextSlot: "Tomorrow · 10:00 AM",
    bio: "Neurological rehab specialist focused on regaining functional independence.",
    avatar: "VS",
  },
  {
    id: "dr-mira-desai",
    name: "Dr. Mira Desai",
    title: "DPT, Pelvic Health",
    clinic: "Cadence Women's Health",
    city: "Bengaluru, HSR Layout",
    distance: "3.1 km",
    rating: 5.0,
    reviews: 142,
    specialties: ["Post-natal", "Pelvic Floor", "Lower Back"],
    price: 1200,
    nextSlot: "Today · 6:00 PM",
    bio: "Pre and post-natal recovery, pelvic floor therapy, chronic lower back care.",
    avatar: "MD",
  },
  {
    id: "dr-arjun-mehta",
    name: "Dr. Arjun Mehta",
    title: "MPT, Ortho",
    clinic: "Kinetic Ortho Clinic",
    city: "Bengaluru, Whitefield",
    distance: "5.7 km",
    rating: 4.7,
    reviews: 356,
    specialties: ["Knee Replacement", "Shoulder", "Posture"],
    price: 850,
    nextSlot: "Tomorrow · 9:30 AM",
    bio: "Post-surgical orthopedic rehab with a focus on strength and mobility restoration.",
    avatar: "AM",
  },
  {
    id: "dr-lea-thomas",
    name: "Dr. Lea Thomas",
    title: "DPT, Geriatric",
    clinic: "Silverline Physiotherapy",
    city: "Bengaluru, Jayanagar",
    distance: "4.3 km",
    rating: 4.9,
    reviews: 208,
    specialties: ["Fall Prevention", "Arthritis", "Balance"],
    price: 950,
    nextSlot: "Today · 5:15 PM",
    bio: "Helping seniors stay independent through balance training and joint mobility work.",
    avatar: "LT",
  },
  {
    id: "dr-rohan-iyer",
    name: "Dr. Rohan Iyer",
    title: "MPT, Sports",
    clinic: "Peak Athletic Recovery",
    city: "Bengaluru, MG Road",
    distance: "2.9 km",
    rating: 4.8,
    reviews: 267,
    specialties: ["Running Injuries", "Marathon Prep", "Ankle"],
    price: 1000,
    nextSlot: "Tomorrow · 7:00 AM",
    bio: "Endurance-athlete rehab, biomechanical assessment, gait analysis.",
    avatar: "RI",
  },
];

export const videos = [
  {
    id: "v1",
    title: "Lower Back Relief: 8-Minute Daily Routine",
    doctor: "Dr. Anika Rao",
    duration: "8:24",
    views: "42k",
    category: "Back Pain",
    thumb: "from-blue-500 to-indigo-700",
  },
  {
    id: "v2",
    title: "Post-ACL Week 4: Quad Activation",
    doctor: "Dr. Arjun Mehta",
    duration: "12:10",
    views: "28k",
    category: "Knee",
    thumb: "from-indigo-500 to-purple-700",
  },
  {
    id: "v3",
    title: "Shoulder Impingement: Mobility Flow",
    doctor: "Dr. Rohan Iyer",
    duration: "9:45",
    views: "36k",
    category: "Shoulder",
    thumb: "from-sky-500 to-blue-800",
  },
  {
    id: "v4",
    title: "Post-natal Core Reconnect (Beginner)",
    doctor: "Dr. Mira Desai",
    duration: "15:02",
    views: "51k",
    category: "Post-natal",
    thumb: "from-violet-500 to-blue-700",
  },
  {
    id: "v5",
    title: "Balance & Fall Prevention for Seniors",
    doctor: "Dr. Lea Thomas",
    duration: "11:30",
    views: "19k",
    category: "Geriatric",
    thumb: "from-cyan-500 to-indigo-700",
  },
  {
    id: "v6",
    title: "Runner's Ankle: Stability Circuit",
    doctor: "Dr. Rohan Iyer",
    duration: "7:18",
    views: "24k",
    category: "Ankle",
    thumb: "from-blue-600 to-slate-900",
  },
];

export const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "02:00 PM", "02:30 PM", "03:00 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "06:00 PM",
];
