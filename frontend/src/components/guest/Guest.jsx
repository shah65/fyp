/**
 * Guest.jsx — AWKUM FYP Showcase (with routing & detailed views)
 * Dependencies: framer-motion, react-router-dom
 *   npm install framer-motion react-router-dom
 */

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import awkum from "../../public/awkumimg1.png";

// ─────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyle = () => {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: #04070f; color: #e2e8f0; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: #04070f; }
      ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.35); border-radius: 10px; }
      input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
      input:focus, textarea:focus {
        outline: none;
        border-color: rgba(56,189,248,0.55) !important;
        box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
      }
      button { font-family: 'DM Sans', sans-serif; }
      .glass {
        background: rgba(255,255,255,0.055);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .glass-dark {
        background: rgba(4,7,15,0.82);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        border: 1px solid rgba(255,255,255,0.09);
      }
      a { text-decoration: none; color: inherit; }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);
  return null;
};

// ─────────────────────────────────────────────
//  FRAMER MOTION VARIANTS
// ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.8, 0.25, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.8, 0.25, 1] },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.45 },
  }),
};

const VP = { once: true, margin: "-60px" };

// ─────────────────────────────────────────────
//  ANIMATED NUMBER
// ─────────────────────────────────────────────
function AnimNum({ value }) {
  const digits = parseInt(value.replace(/\D/g, ""), 10);
  const suffix = value.replace(/[\d,]/g, "").trim();
  const [cur, setCur] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current && !isNaN(digits)) {
          started.current = true;
          let i = 0;
          const steps = 55;
          const t = setInterval(() => {
            i++;
            setCur(Math.min(digits, Math.round(digits * (i / steps))));
            if (i >= steps) clearInterval(t);
          }, 1300 / steps);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [digits]);

  if (isNaN(digits)) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {cur.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const STATS = [
  {
    icon: "🇵🇰", value: "5th",
    label: "Rank in Pakistan", source: "THE Asia Rankings 2024",
    detail: "5th among all Pakistani universities — Times Higher Education Asia University Rankings 2024.",
  },
  {
    icon: "🏔️", value: "#1",
    label: "Rank in KPK", source: "THE Asia Rankings 2024",
    detail: "#1 university in Khyber Pakhtunkhwa — Times Higher Education Asia University Rankings 2024. The top-ranked public university in the province.",
  },
  {
    icon: "🌏", value: "149th",
    label: "Rank in Asia", source: "THE Asia Rankings 2024",
    detail: "149th across Asia — THE Asia University Rankings 2024. One of only 2 Pakistani universities in the top 150 Asian institutions.",
  },
  {
    icon: "💻", value: "401–500",
    label: "CS World Rank", source: "THE Subject 2024",
    detail: "Computer Science ranked 401–500 globally — THE World University Rankings by Subject 2024. First-ever CS global subject ranking achieved by AWKUM.",
  },
  {
    icon: "🎓", value: "30,000+",
    label: "Students Enrolled", source: "AWKUM Official",
    detail: "One of the largest universities in KP by active enrollment across all programs and nine campuses.",
  },
  {
    icon: "🔬", value: "8,942+",
    label: "Research Publications", source: "EduRank 2025",
    detail: "8,942 indexed academic publications with 159,471+ global citations — reflecting strong and growing research output.",
  },
];

const LEADERS = [
  {
    role: "Vice Chancellor",
    name: "Prof. Dr. Jamil Ahmad",
    since: "May 9, 2025",
    icon: "🏛️",
    color: "#38bdf8",
    bio: "Prof. Dr. Jamil Ahmad assumed the office of Vice Chancellor of Abdul Wali Khan University Mardan on May 9, 2025. A distinguished academic and administrator, he leads AWKUM's mission of quality education and research excellence across Khyber Pakhtunkhwa.",
  },
  {
    role: "Chairperson — CS Dept. (Garden Campus)",
    name: "Dr. Nadeem Iqbal",
    since: "Garden Campus",
    icon: "💻",
    color: "#a78bfa",
    bio: "Dr. Nadeem Iqbal serves as Chairperson of the Department of Computer Science at AWKUM's Garden Campus. Under his leadership the department achieved its first-ever global subject ranking (401–500) in THE World University Rankings 2024.",
  },
];

const TECHS = [
  "All",
  "React",
  "Node.js",
  "Python",
  "Flutter",
  "Django",
  "MongoDB",
  "Firebase",
  "Machine Learning",
  "IoT",
];
const SEMS = ["All", "Fall 2024", "Spring 2024", "Fall 2023"];

const TECH_CLR = {
  React: "#38bdf8",
  "Node.js": "#4ade80",
  Python: "#fde047",
  Flutter: "#7dd3fc",
  Django: "#86efac",
  MongoDB: "#4ade80",
  Firebase: "#fdba74",
  "Machine Learning": "#c084fc",
  IoT: "#22d3ee",
};

// Enhanced project data with architectural details
const PROJECTS = [
  {
    id: 1,
    semester: "Fall 2024",
    name: "MediCare – Hospital Management System",
    description:
      "Full-stack web app streamlining patient registration, appointments, doctor management and billing. Role-based access for admins, doctors and nurses.",
    technologies: ["React", "Node.js", "MongoDB"],
    architecture: "MVC with RESTful API",
    language: "JavaScript (ES6+)",
    frameworks: ["Express.js", "React Router"],
    database: "MongoDB (Mongoose ODM)",
    uiLib: "Tailwind CSS + Headless UI",
    features: [
      "Multi-role authentication (JWT)",
      "Real‑time appointment booking",
      "Prescription & billing modules",
      "Admin dashboard with analytics",
      "Responsive mobile‑first design",
    ],
    challenges: "Secure role‑based access and real‑time data sync across departments.",
    groupLeader: "Ahmad Bilal",
    members: ["Sana Ullah", "Zara Khan"],
    department: "Computer Science",
    email: "ahmad.bilal@student.awkum.edu.pk",
    github: "https://github.com/ahmadbilal/medicare",
  },
  {
    id: 2,
    semester: "Fall 2024",
    name: "CropSense – AI Crop Disease Detector",
    description:
      "Mobile app using ML to detect crop diseases from farmer photos. Provides treatment suggestions and connects farmers to agricultural experts in real time.",
    technologies: ["Flutter", "Python", "Machine Learning", "Firebase"],
    architecture: "Client‑Server with Cloud Functions",
    language: "Python (backend), Dart (frontend)",
    frameworks: ["TensorFlow Lite", "Flutter SDK"],
    database: "Firebase Firestore + Cloud Storage",
    uiLib: "Material Design 3",
    features: [
      "On‑device ML inference (TensorFlow Lite)",
      "Expert chat with real‑time messaging",
      "Weather & soil data integration",
      "Multi‑language support (Urdu, English)",
      "Offline mode for basic diagnosis",
    ],
    challenges: "Optimising ML model for low‑end devices and offline usage.",
    groupLeader: "Nadia Rehman",
    members: ["Imran Gul", "Hassan Raza"],
    department: "Software Engineering",
    email: "nadia.rehman@student.awkum.edu.pk",
    github: "https://github.com/nadiarehman/cropsense",
  },
  {
    id: 3,
    semester: "Spring 2024",
    name: "EduTrack – Student Performance Analytics",
    description:
      "Web platform tracking GPA trends and attendance, predicting at-risk students using analytics dashboards with visualizations and automated alerts.",
    technologies: ["React", "Django", "Python"],
    architecture: "Three‑tier (React SPA + Django REST API + PostgreSQL)",
    language: "Python (backend), TypeScript (frontend)",
    frameworks: ["Django REST Framework", "React + Vite"],
    database: "PostgreSQL + Redis caching",
    uiLib: "Ant Design + Recharts",
    features: [
      "Predictive ML model (scikit‑learn)",
      "Drag‑and‑drop report builder",
      "Automated email/SMS alerts",
      "LDAP/SSO integration",
      "Export to Excel / PDF",
    ],
    challenges: "Integrating with legacy university LMS and ensuring data privacy.",
    groupLeader: "Usman Tariq",
    members: ["Ayesha Naz", "Faisal Mir"],
    department: "Information Technology",
    email: "usman.tariq@student.awkum.edu.pk",
    github: "https://github.com/usmantariq/edutrack",
  },
  {
    id: 4,
    semester: "Spring 2024",
    name: "SmartParking – IoT Parking Management",
    description:
      "IoT-based smart parking using ultrasonic sensors. Web dashboard shows live slot availability and lets users reserve spots through a mobile interface.",
    technologies: ["IoT", "Node.js", "React", "Firebase"],
    architecture: "Edge‑to‑Cloud (MQTT + Cloud Firestore)",
    language: "JavaScript (Node.js) + Embedded C",
    frameworks: ["Express.js", "React", "Arduino framework"],
    database: "Firebase Realtime Database + Firestore",
    uiLib: "Chakra UI",
    features: [
      "Real‑time slot map (WebSockets)",
      "QR‑based entry/exit",
      "Admin analytics (peak hours)",
      "Payment integration (JazzCash)",
      "Low‑power sensor nodes",
    ],
    challenges: "Sensor calibration and reliable real‑time sync over 4G networks.",
    groupLeader: "Bilal Hussain",
    members: ["Mariam Iqbal", "Tariq Shah"],
    department: "Computer Science",
    email: "bilal.hussain@student.awkum.edu.pk",
    github: "https://github.com/bilalhussain/smartparking",
  },
  {
    id: 5,
    semester: "Fall 2023",
    name: "LegalAid – Legal Document Assistant",
    description:
      "AI-powered chatbot and document generator for Pakistani legal context. Helps citizens understand rights, fill legal forms, and find nearby lawyers by specialization.",
    technologies: ["React", "Python", "Machine Learning", "Node.js"],
    architecture: "Microservices (Docker) + NLP pipeline",
    language: "Python (NLP & backend), JavaScript (frontend)",
    frameworks: ["FastAPI", "React", "spaCy", "Hugging Face Transformers"],
    database: "MongoDB + Elasticsearch",
    uiLib: "Material UI",
    features: [
      "Natural language understanding for legal queries",
      "Dynamic PDF form generation",
      "Lawyer directory with geo‑search",
      "Case law similarity search",
      "Multi‑language (Urdu/English)",
    ],
    challenges: "Training domain‑specific NLP models with limited legal datasets.",
    groupLeader: "Saima Bibi",
    members: ["Jawad Khan", "Rida Fatima"],
    department: "Computer Science",
    email: "saima.bibi@student.awkum.edu.pk",
    github: "https://github.com/saimabibi/legalaid",
  },
  {
    id: 6,
    semester: "Fall 2023",
    name: "UniRide – Carpooling App for Students",
    description:
      "Mobile carpooling for students to share rides via route matching. In-app chat, cost splitting, driver rating system and live location tracking.",
    technologies: ["Flutter", "Firebase", "Node.js"],
    architecture: "Serverless (Firebase Functions + Flutter)",
    language: "Dart (frontend), Node.js (backend)",
    frameworks: ["Flutter", "Firebase Cloud Functions"],
    database: "Cloud Firestore + Firebase Auth",
    uiLib: "Custom Flutter widgets",
    features: [
      "Real‑time GPS tracking",
      "In‑app chat with read receipts",
      "Fare splitting & digital wallet",
      "Driver/rider rating system",
      "SOS button & emergency contact",
    ],
    challenges: "Accurate route matching algorithm and real‑time location updates.",
    groupLeader: "Hamza Afzal",
    members: ["Noor Ul Ain", "Arslan Meer"],
    department: "Software Engineering",
    email: "hamza.afzal@student.awkum.edu.pk",
    github: "https://github.com/hamzaafzal/uniride",
  },
];

// ─────────────────────────────────────────────
//  LOCAL STORAGE
// ─────────────────────────────────────────────
const LS_KEY = "awkum_fyp_requests";
const loadReqs = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
};
const saveReq = (id, data) => {
  const r = loadReqs();
  r[id] = data;
  localStorage.setItem(LS_KEY, JSON.stringify(r));
};

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({ stat }) {
  const [tip, setTip] = useState(false);
  return (
    <motion.div
      variants={cardVariant}
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
      whileHover={{
        y: -7,
        boxShadow: "0 28px 56px rgba(0,0,0,0.4)",
        borderColor: "rgba(255,255,255,0.24)",
      }}
      className="glass"
      style={{
        borderRadius: 16,
        padding: "22px 18px",
        textAlign: "center",
        cursor: "default",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 8 }}>{stat.icon}</div>
      <div
        style={{
          fontSize: 25,
          fontWeight: 800,
          color: "#fff",
          fontFamily: "'Cormorant Garamond',serif",
          lineHeight: 1,
        }}
      >
        <AnimNum value={stat.value} />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.52)",
          marginTop: 6,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {stat.label}
      </div>
      <div
        style={{
          fontSize: 9.5,
          color: "rgba(56,189,248,0.65)",
          marginTop: 3,
          fontWeight: 500,
        }}
      >
        {stat.source}
      </div>

      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(4,7,15,0.97)",
              border: "1px solid rgba(56,189,248,0.28)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 12,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.65,
              width: 220,
              zIndex: 50,
              textAlign: "left",
              boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            }}
          >
            {stat.detail}
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%) rotate(-45deg)",
                width: 10,
                height: 10,
                background: "rgba(4,7,15,0.97)",
                borderLeft: "1px solid rgba(56,189,248,0.28)",
                borderBottom: "1px solid rgba(56,189,248,0.28)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  LEADER CARD
// ─────────────────────────────────────────────
function LeaderCard({ leader }) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{
        y: -6,
        boxShadow: "0 28px 56px rgba(0,0,0,0.38)",
        borderColor: "rgba(255,255,255,0.22)",
      }}
      className="glass"
      style={{ borderRadius: 20, padding: "26px", flex: 1, minWidth: 280 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.08, rotate: 4 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: `${leader.color}18`,
            border: `1.5px solid ${leader.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {leader.icon}
        </motion.div>
        <div>
          <div
            style={{
              fontSize: 10.5,
              color: leader.color,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 3,
            }}
          >
            {leader.role}
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#f1f5f9",
              fontFamily: "'Cormorant Garamond',serif",
            }}
          >
            {leader.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.38)",
              marginTop: 2,
            }}
          >
            Since {leader.since}
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,0.58)",
          lineHeight: 1.78,
        }}
      >
        {leader.bio}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  TECH BADGE
// ─────────────────────────────────────────────
function TechBadge({ tech }) {
  const c = TECH_CLR[tech] || "#e2e8f0";
  return (
    <motion.span
      whileHover={{ scale: 1.06 }}
      style={{
        background: `${c}14`,
        border: `1px solid ${c}32`,
        color: c,
        borderRadius: 20,
        padding: "3px 11px",
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {tech}
    </motion.span>
  );
}

// ─────────────────────────────────────────────
//  REQUEST MODAL (unchanged behaviour)
// ─────────────────────────────────────────────
function RequestModal({ project, reqs, onClose, onSave }) {
  const existing = reqs[project.id];
  const [form, setForm] = useState({ name: "", email: "", reason: "" });
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(!!existing);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrs(e);
      return;
    }
    const data = {
      ...form,
      projectId: project.id,
      projectName: project.name,
      groupLeader: project.groupLeader,
      groupLeaderEmail: project.email,
      status: "pending",
      ts: Date.now(),
    };
    saveReq(project.id, data);
    onSave(project.id, data);
    setDone(true);
  };

  const inp = (err) => ({
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${err ? "#f87171" : "rgba(255,255,255,0.13)"}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "inherit",
  });

  const STEPS = [
    {
      icon: "📤",
      txt: `Your request (name, email, reason) is emailed to ${project.groupLeader} at their AWKUM student email.`,
    },
    {
      icon: "👁️",
      txt: "The group leader opens the email in their inbox and decides whether to approve your request.",
    },
    {
      icon: "✅",
      txt: "Approved → they reply to your email with the GitHub repository link directly.",
    },
    {
      icon: "❌",
      txt: "Declined → you receive a polite email with the reason. You may request again.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="glass-dark"
        style={{
          borderRadius: 22,
          padding: "34px 30px",
          maxWidth: 500,
          width: "100%",
          position: "relative",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", padding: "8px 0" }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{ fontSize: 54, marginBottom: 14 }}
              >
                📨
              </motion.div>
              <h3
                style={{
                  fontSize: 20,
                  color: "#fff",
                  fontFamily: "'Cormorant Garamond',serif",
                  marginBottom: 10,
                }}
              >
                Request Sent!
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                }}
              >
                Emailed to{" "}
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  {project.groupLeader}
                </span>{" "}
                at
                <br />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                  {project.email}
                </span>
              </p>

              <div
                style={{
                  background: "rgba(56,189,248,0.07)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 14,
                  padding: "18px 20px",
                  textAlign: "left",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.38)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 14,
                  }}
                >
                  📬 What happens next
                </div>
                {STEPS.map((s, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={slideLeft}
                    initial="hidden"
                    animate="visible"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: i < 3 ? 10 : 0,
                    }}
                  >
                    <span
                      style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}
                    >
                      {s.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.62)",
                        lineHeight: 1.65,
                      }}
                    >
                      {s.txt}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div
                style={{
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "rgba(251,191,36,0.85)",
                  marginBottom: 20,
                }}
              >
                ⏳ Status: <strong>Pending</strong> — Watch your inbox for a
                reply from {project.groupLeader}.
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 34px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Got it ✓
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 22 }}>🔐</span>
                  <h3
                    style={{
                      fontSize: 18,
                      color: "#fff",
                      fontFamily: "'Cormorant Garamond',serif",
                    }}
                  >
                    Request GitHub Access
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.42)",
                    lineHeight: 1.7,
                  }}
                >
                  Your request will be{" "}
                  <strong style={{ color: "rgba(255,255,255,0.65)" }}>
                    emailed directly to {project.groupLeader}
                  </strong>
                  . If approved, they reply to your email with the repo link.
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  {
                    key: "name",
                    label: "Your Full Name",
                    type: "text",
                    ph: "Ali Hassan",
                  },
                  {
                    key: "email",
                    label: "Your Email",
                    type: "email",
                    ph: "ali@awkum.edu.pk",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.38)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {f.label} *
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.ph}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      style={inp(errs[f.key])}
                    />
                    <AnimatePresence>
                      {errs[f.key] && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontSize: 11,
                            color: "#f87171",
                            marginTop: 4,
                          }}
                        >
                          {errs[f.key]}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.38)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Reason (optional)
                  </label>
                  <textarea
                    placeholder="Why do you want access to this project's source code?"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    rows={3}
                    style={{ ...inp(false), resize: "vertical" }}
                  />
                </div>
                <div
                  style={{
                    background: "rgba(56,189,248,0.07)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.52)",
                    lineHeight: 1.7,
                  }}
                >
                  📧 {project.groupLeader} will receive your request and reply
                  to{" "}
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>
                    {form.email || "your email"}
                  </strong>
                  .
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      padding: "12px",
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 12px 32px rgba(14,165,233,0.4)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    style={{
                      flex: 2,
                      background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                      border: "none",
                      borderRadius: 12,
                      padding: "12px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      boxShadow: "0 8px 24px rgba(14,165,233,0.28)",
                    }}
                  >
                    Send Request 📨
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  PROJECT CARD (with explicit Explore button)
// ─────────────────────────────────────────────
function ProjectCard({ project, reqs, onRequest }) {
  const navigate = useNavigate();   // add this at the top of ProjectCard

  const req = reqs[project.id];
  const isPending = req?.status === "pending";
  const isApproved = req?.status === "approved";

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -7, boxShadow: "0 28px 56px rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.2)" }}
      className="glass"
      style={{ borderRadius: 20, padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Card header – no Link overlay */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div>
          <div style={{
            fontSize: 10.5, color: "#38bdf8", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: 1.5, marginBottom: 5
          }}>
            {project.semester} · {project.department}
          </div>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: "#f1f5f9",
            fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.3
          }}>
            {project.name}
          </h3>
        </div>
        <motion.span whileHover={{ rotate: 15, scale: 1.15 }} style={{ fontSize: 22, flexShrink: 0, display: "inline-block" }}>
          💡
        </motion.span>
      </div>

      <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.58)", lineHeight: 1.78, flexGrow: 1 }}>
        {project.description}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {project.technologies.map(t => <TechBadge key={t} tech={t} />)}
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10
      }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginBottom: 3 }}>Group Leader</div>
          <div style={{ fontSize: 13.5, color: "#e2e8f0", fontWeight: 700 }}>👤 {project.groupLeader}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 2 }}>+ {project.members.join(", ")}</div>
        </div>

        {/* BUTTON GROUP */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* 1. Explore button (relative path) */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`project/${project.id}`);   // ✅ relative to /guest/
            }}
            style={{ /* ... keep your styles ... */ }}
          >
            🔍 Explore Project
          </motion.button>

          {/* 2. Request / View Repo button (unchanged) */}
          {isApproved ? (
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href={project.github}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                border: "none", borderRadius: 10, padding: "9px 16px",
                color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
                boxShadow: "0 6px 20px rgba(34,197,94,0.22)", cursor: "pointer"
              }}
            >
              🔗 View Repo
            </motion.a>
          ) : isPending ? (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: 10, padding: "9px 14px", fontSize: 12, color: "#fbbf24", fontWeight: 600
              }}
            >
              ⏳ Pending
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, background: "rgba(99,102,241,0.22)" }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onRequest(project);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.36)",
                borderRadius: 10, padding: "9px 16px", color: "#a5b4fc", fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}
            >
              🔐 Request GitHub
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  SECTION HELPERS
// ─────────────────────────────────────────────
function SectionBadge({ label, color }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VP}
      variants={fadeIn}
      style={{
        display: "inline-block",
        background: `${color}12`,
        border: `1px solid ${color}35`,
        borderRadius: 30,
        padding: "4px 18px",
        marginBottom: 14,
      }}
    >
      <span
        style={{
          fontSize: 11.5,
          color,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.6,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VP}
      variants={fadeUp}
    >
      <h2
        style={{
          fontSize: "clamp(22px,3.5vw,38px)",
          fontFamily: "'Cormorant Garamond',serif",
          fontWeight: 700,
          color: "#f1f5f9",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <p style={{ color: "rgba(255,255,255,0.43)", fontSize: 15 }}>{sub}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  HERO PARALLAX BACKGROUND
// ─────────────────────────────────────────────
function HeroBg() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  return (
    <motion.div
      style={{ position: "absolute", inset: 0, y, opacity, zIndex: 0 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${awkum})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.27) saturate(0.7)",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  MAIN SHOWCASE PAGE (Home)
// ─────────────────────────────────────────────
function HomePage() {
  const [search, setSearch] = useState("");
  const [tech, setTech] = useState("All");
  const [sem, setSem] = useState("All");
  const [modal, setModal] = useState(null);
  const [reqs, setReqs] = useState(loadReqs);
  const projectsRef = useRef(null);

  const filtered = PROJECTS.filter((p) => {
    const q = search.toLowerCase();
    const mQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.groupLeader.toLowerCase().includes(q);
    const mT = tech === "All" || p.technologies.includes(tech);
    const mS = sem === "All" || p.semester === sem;
    return mQ && mT && mS;
  });

  const chip = (active, accent) => ({
    padding: "6px 16px",
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    background: active ? `${accent}14` : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? `${accent}55` : "rgba(255,255,255,0.1)"}`,
    color: active ? accent : "rgba(255,255,255,0.48)",
  });

  return (
    <>
      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <HeroBg />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom,rgba(4,7,15,0.2) 0%,rgba(4,7,15,0.72) 70%,#04070f 100%)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.025) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "6%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(56,189,248,0.07)",
            filter: "blur(90px)",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "8%",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(167,139,250,0.08)",
            filter: "blur(80px)",
            zIndex: 2,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 3,
            textAlign: "center",
            padding: "90px 24px 60px",
            maxWidth: 960,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.28)",
              borderRadius: 30,
              padding: "6px 20px",
              marginBottom: 28,
            }}
          >
            <span>🏛️</span>
            <span
              style={{
                fontSize: 11.5,
                color: "#38bdf8",
                fontWeight: 700,
                letterSpacing: 1.8,
                textTransform: "uppercase",
              }}
            >
              Abdul Wali Khan University Mardan
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              fontSize: "clamp(30px,5.5vw,60px)",
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Final Year Project{" "}
            <em
              style={{
                background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontStyle: "italic",
              }}
            >
              Showcase
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.52)",
              lineHeight: 1.85,
              maxWidth: 520,
              margin: "0 auto 52px",
            }}
          >
            Discover innovative projects built by AWKUM students. Browse by
            technology, connect with teams, and request code access.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.35,
                },
              },
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
              gap: 12,
              marginBottom: 56,
            }}
          >
            {STATS.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 16px 52px rgba(14,165,233,0.45)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              projectsRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
              border: "none",
              borderRadius: 16,
              padding: "15px 40px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 10px 36px rgba(14,165,233,0.3)",
            }}
          >
            Explore FYP Projects ↓
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              marginTop: 44,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Scroll
            </span>
            <motion.div
              animate={{ scaleY: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                width: 1,
                height: 40,
                background:
                  "linear-gradient(to bottom,rgba(56,189,248,0.7),transparent)",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── LEADERSHIP ── */}
      <section style={{ padding: "80px 24px", maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <SectionBadge label="University Leadership" color="#38bdf8" />
          <SectionTitle
            title="Meet Our Leaders"
            sub="The visionaries guiding AWKUM's academic and research excellence"
          />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          variants={staggerGrid}
          style={{ display: "flex", gap: 18, flexWrap: "wrap" }}
        >
          {LEADERS.map((l) => (
            <LeaderCard key={l.role} leader={l} />
          ))}
        </motion.div>
      </section>

      {/* ── PROJECTS ── */}
      <section
        ref={projectsRef}
        style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <SectionBadge label="Student Innovation Hub" color="#a78bfa" />
          <SectionTitle
            title="Browse FYP Projects"
            sub={`${PROJECTS.length} projects from AWKUM students — filter by technology or semester`}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          variants={fadeUp}
          className="glass"
          style={{ borderRadius: 20, padding: "22px 26px", marginBottom: 28 }}
        >
          <div style={{ position: "relative", marginBottom: 20 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.38,
                fontSize: 16,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search project name, description or team member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "12px 14px 12px 42px",
                color: "#e2e8f0",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  ✕
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10.5,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 8,
              }}
            >
              Technology
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {TECHS.map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTech(t)}
                  style={chip(tech === t, "#38bdf8")}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10.5,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 8,
              }}
            >
              Semester
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SEMS.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSem(s)}
                  style={chip(sem === s, "#a78bfa")}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          layout
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
            Showing{" "}
            <motion.span
              key={filtered.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: "#38bdf8",
                fontWeight: 700,
                display: "inline-block",
              }}
            >
              {filtered.length}
            </motion.span>{" "}
            of {PROJECTS.length} projects
          </div>
          <AnimatePresence>
            {(search || tech !== "All" || sem !== "All") && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => {
                  setSearch("");
                  setTech("All");
                  setSem("All");
                }}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "4px 14px",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                ✕ Clear
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ fontSize: 52, marginBottom: 14 }}
              >
                🔎
              </motion.div>
              <p style={{ fontSize: 15 }}>
                No projects match. Try different keywords.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              variants={staggerGrid}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
                gap: 20,
              }}
            >
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  reqs={reqs}
                  onRequest={setModal}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={VP}
        variants={fadeIn}
        style={{
          textAlign: "center",
          padding: "32px 24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.22)",
          fontSize: 12.5,
        }}
      >
        🏛️ Abdul Wali Khan University Mardan · FYP Showcase ·{" "}
        {new Date().getFullYear()}
      </motion.footer>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {modal && (
          <RequestModal
            project={modal}
            reqs={reqs}
            onClose={() => setModal(null)}
            onSave={(id, d) => setReqs((r) => ({ ...r, [id]: d }))}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
//  PROJECT DETAIL PAGE
// ─────────────────────────────────────────────
function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = PROJECTS.find((p) => p.id === parseInt(id, 10));

  if (!project) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
          Project not found.
        </p>
        <Link
          to="/"
          style={{ color: "#38bdf8", textDecoration: "underline" }}
        >
          Go back to showcase
        </Link>
      </div>
    );
  }

  const [reqs, setReqs] = useState(loadReqs);
  const [showModal, setShowModal] = useState(false);

  const req = reqs[project.id];
  const isPending = req?.status === "pending";
  const isApproved = req?.status === "approved";

  const handleSave = (id, data) => {
    setReqs((prev) => ({ ...prev, [id]: data }));
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 24px 80px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 860, margin: "0 auto" }}
      >
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/guest")}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "8px 18px",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to Showcase
        </motion.button>

        {/* Project header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "#38bdf8",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginBottom: 8,
                }}
              >
                {project.semester} · {project.department}
              </div>
              <h1
                style={{
                  fontSize: "clamp(24px,4vw,40px)",
                  fontFamily: "'Cormorant Garamond',serif",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  lineHeight: 1.2,
                  marginBottom: 12,
                }}
              >
                {project.name}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.58)",
                  lineHeight: 1.85,
                  maxWidth: 600,
                }}
              >
                {project.description}
              </p>
            </div>
            <motion.span
              whileHover={{ rotate: 10, scale: 1.1 }}
              style={{ fontSize: 36 }}
            >
              💡
            </motion.span>
          </div>
        </div>

        {/* Tech stack badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {project.technologies.map((t) => (
            <TechBadge key={t} tech={t} />
          ))}
        </div>

        {/* Detail cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <DetailBox label="🧠 Architecture" value={project.architecture} />
          <DetailBox label="💬 Language" value={project.language} />
          <DetailBox
            label="⚙️ Frameworks"
            value={project.frameworks.join(", ")}
          />
          <DetailBox label="🗄️ Database" value={project.database} />
          <DetailBox label="🎨 UI Library" value={project.uiLib} />
        </div>

        {/* Features list */}
        <div style={{ marginBottom: 32 }}>
          <h3
            style={{
              fontSize: 16,
              color: "#a78bfa",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 14,
            }}
          >
            ✨ Key Features
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: 10 }}>
            {project.features.map((f, i) => (
              <motion.li
                key={i}
                variants={slideLeft}
                custom={i}
                initial="hidden"
                animate="visible"
                className="glass"
                style={{
                  borderRadius: 12,
                  padding: "8px 16px",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                ✓ {f}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div
          className="glass"
          style={{
            borderRadius: 16,
            padding: "20px",
            marginBottom: 32,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fbbf24", marginBottom: 8 }}>
            🚧 Development Challenges
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{project.challenges}</p>
        </div>

        {/* Team & Action */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.36)",
                marginBottom: 6,
              }}
            >
              Group Leader
            </div>
            <div style={{ fontSize: 16, color: "#e2e8f0", fontWeight: 700 }}>
              👤 {project.groupLeader}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                marginTop: 4,
              }}
            >
              + {project.members.join(", ")}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                marginTop: 8,
              }}
            >
              📧 {project.email}
            </div>
          </div>

          <div>
            {isApproved ? (
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                href={project.github}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                  cursor: "pointer",
                }}
              >
                🔗 View Repository
              </motion.a>
            ) : isPending ? (
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontSize: 14,
                  color: "#fbbf24",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                ⏳ Access Request Pending
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(14,165,233,0.28)",
                }}
              >
                🔐 Request GitHub Access
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Request modal (same as before, can be reused) */}
      <AnimatePresence>
        {showModal && (
          <RequestModal
            project={project}
            reqs={reqs}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for detail boxes
function DetailBox({ label, value }) {
  return (
    <motion.div
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className="glass"
      style={{ borderRadius: 14, padding: "16px" }}
    >
      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 500 }}>
        {value}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  ROUTER WRAPPER (default export)
// ─────────────────────────────────────────────
export default function Guest() {
  return (
    < >
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
      </Routes>
    </>
  );
}