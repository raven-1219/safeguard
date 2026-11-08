# SAFE GUARD: Privacy, Data Protection & Application Security

This document outlines the security architecture, data handling practices, and privacy safeguards implemented in **SAFE GUARD**.

---

## 1. Video & Biometric Privacy Policy

### 1.1 Local Edge Processing (Zero Video Upload)
- **Principle**: The driver's webcam video feed is processed **strictly in client-side volatile memory (RAM)** using the browser's HTML5 Canvas and WebAssembly.
- **No Video Recording or Transmission**: At no point are video streams, raw pixel frames, or facial photographs uploaded to Supabase, Vercel, or any third-party server.
- **Computed Telemetry Only**: Only lightweight numerical metrics (such as scalar EAR, MAR, head pitch angles, and categorical safety states) are transmitted to the database.

### 1.2 Explicit Camera Permission & Indicators
- Webcam access requires explicit browser permission via `navigator.mediaDevices.getUserMedia()`.
- The user is provided with a persistent visual status indicator (`AI Monitoring Active`), an FPS counter, and an immediate **Stop Monitoring** button that releases the hardware camera lock.
- All `MediaStreamTrack` references are explicitly halted upon component unmount, ensuring the laptop's physical camera LED turns off.

---

## 2. Authentication & Authorization Security

### 2.1 Role-Based Access Control (RBAC)
SAFE GUARD enforces three strict access tiers:
1. **Driver**: Limited to initiating their assigned trip, viewing their live camera HUD, and reviewing their personal event history.
2. **Moderator**: Restricted to supervising their assigned cohort of 10 to 50 drivers. Cross-group inspection is blocked at both UI and database levels.
3. **Administrator**: Organization-wide management of vehicles, driver assignments, moderator groups, and audit logs.

### 2.2 Database-Level Defense (Row Level Security)
- Security does not rely on frontend route guards.
- All 12 PostgreSQL tables in Supabase have **Row Level Security (RLS) enabled**.
- Database-level security functions (`auth.is_admin()`, `auth.is_moderator_for_driver()`) enforce access controls at the SQL engine level. Even if a user tampers with frontend state or API parameters, the database refuses unauthorized reads and writes.

---

## 3. Secret Management & API Protection

### 3.1 Environment Variables
- Public credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) only hold anonymous public access privileges constrained by RLS.
- Sensitive credentials (`SUPABASE_SERVICE_ROLE_KEY`) are stored in server-only environment variables and never bundled into client JavaScript.
- A template `.env.example` file is provided for deployment setup without exposing production keys.

### 3.2 Audit Logging
- Administrative actions (registering drivers, adding vehicles, updating assignments, resolving critical emergencies) automatically trigger entries in `audit_logs` with timestamps and client IP addresses for forensic traceability.

---

## 4. Academic Demonstration Privacy Statement

For classroom, academic, and project defense demonstrations:
- Demonstration profiles (`Rajesh Kumar`, `Priya Sharma`, `Transit Director`) use synthetic identifiers.
- Testing scenarios for sudden collapse and convulsions utilize a safe, controlled test trigger button rather than requiring test subjects to simulate physical distress.
- When browser geolocation is enabled, coordinates are used strictly to display the current demo laptop terminal on OpenStreetMap and are not shared with external advertising or tracking networks.

