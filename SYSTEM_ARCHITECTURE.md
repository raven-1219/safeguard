# SAFE GUARD: System Architecture & Technical Specifications

**Project Title**: AI-Based Intelligent Driver Safety, Health Emergency and Real-Time Vehicle Monitoring System for Public Transportation  
**System Name**: SAFE GUARD  
**Target Environment**: Laptop Web Browser (Next.js 14 App Router, Vercel-ready, Supabase Backend)

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph LaptopEdge ["Laptop Client Layer (Edge Computer Vision)"]
        Webcam["Laptop Integrated Webcam (640x480 @ 30 FPS)"]
        Audio["Web Audio API Synthesizer (Offline Multi-Tone Alarms)"]
        Geo["HTML5 Geolocation API (Browser Station Coordinates)"]

        subgraph VisionEngine ["Vision & Telemetry Pipeline"]
            Enhance["Low-Light CLAHE & Gamma LUT (γ=0.55)"]
            FaceLandmarks["MediaPipe FaceMesh (468 3D Landmarks)"]
            TemporalANN["1D Temporal Conv1D / Kinematic Neural Model"]
            PoseDetector["Upper-Body Pose Emergency Detector"]
            SeatBelt["Chest Diagonal Contrast & FOV Safeguard"]
        end

        subgraph OfflineLayer ["Offline Event Queue & Storage"]
            IDB["IndexedDB Event Queue (Idempotency Keys)"]
            SyncManager["Automatic Online Network Flush"]
            i18n["Bilingual i18n Dictionary (English & Telugu)"]
        end
    end

    subgraph AppRouter ["Next.js 14 App Router (React 18)"]
        DriverView["/driver - Driver HUD & Trip Lifecycle"]
        ModView["/moderator - Assigned Fleet Grid & Map"]
        AdminView["/admin - Fleet Assignments & CSV Exporter"]
        AuthView["/login - Role-Based Authentication"]
        ReportView["/reports - Printable Safety Certificate"]
        APIs["/api/events, /api/trips, /api/reports"]
    end

    subgraph CloudLayer ["Supabase PostgreSQL & Security"]
        Postgres["12 Relational Tables (UUIDs, Foreign Keys, Checks)"]
        RLS["Row Level Security Policies (Driver / Mod / Admin)"]
        Realtime["Realtime WebSocket Event Broadcast"]
    end

    Webcam --> Enhance --> FaceLandmarks & TemporalANN & PoseDetector & SeatBelt
    FaceLandmarks & TemporalANN & PoseDetector & SeatBelt --> Audio
    FaceLandmarks & TemporalANN & PoseDetector & SeatBelt --> IDB
    IDB --> SyncManager --> APIs <--> Postgres
    SyncManager --> Realtime
    Postgres <--> RLS
    DriverView & ModView & AdminView & ReportView <--> APIs
    Geo --> DriverView & ModView
```

---

## 2. Core Architectural Principles

1. **Zero External Hardware Dependency**:
   - The entire solution executes on an ordinary student laptop.
   - External hardware (ECG sensors, pulse oximeters, OBD-II dongles, microcontrollers) is strictly excluded.
   - Medical emergency indicators (sudden collapse, convulsion/abnormal motion, unresponsiveness) are computed purely from webcam upper-body geometric kinetics.

2. **Client-Side Heavy, Serverless-Friendly**:
   - Video frame decoding, optical landmark extraction, and neural network inference execute client-side in the browser via WebAssembly (MediaPipe) and WebGL (TensorFlow.js).
   - Next.js serverless functions are reserved for lightweight database queries, event logging, and report compilation, maintaining 100% Vercel compatibility.

3. **Offline Fault-Tolerance**:
   - Audio alarms utilize the browser's native `AudioContext` oscillator, operating without internet access or external audio files.
   - Events occurring during network dropouts are buffered in an IndexedDB queue with idempotency keys, automatically re-synchronizing when connectivity is restored.

4. **Multi-Tenant Role-Based Isolation**:
   - Drivers only have access to their personal active trip and historical monitoring events.
   - Fleet Moderators are strictly restricted to assigned groups of 10–50 drivers.
   - Administrators possess organization-wide authority for fleet registration, vehicle assignments, and audit logging.

5. **First-Class Bilingual Localization**:
   - Centralized dictionary architecture supporting English and Telugu (`te`) without requiring page refreshes.
   - Typography rendered with Noto Sans Telugu to prevent layout breaking or text clipping.

