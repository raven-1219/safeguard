# SAFE GUARD – Browser Compatibility Report

**Date**: 2026-11-08  
**Test Platform**: Windows 11 Laptop

> [!IMPORTANT]
> **Testing Scope Notice**  
> This automated session verified:
> - Production build compilation (all browsers share the same build output)
> - API availability analysis (which browser APIs are used and their compatibility)
> - Bundle size analysis (critical for performance on student laptops)
>
> **Live runtime browser testing** (opening Chrome/Edge, granting webcam permission, observing video) was **NOT conducted** in this automated session.  
> These tests are classified as PARTIAL (source correct) or NOT TESTED (requires human browser session).

---

## 1. Build Output

| Metric | Value |
|--------|-------|
| Build exit code | 0 (success) |
| TypeScript errors | 0 |
| Static pages generated | 12/12 |
| Largest route bundle (`/driver`) | 176 kB first-load JS |
| Shared chunk size | 87.6 kB |
| Total JS for driver page | 176 kB |

> [!TIP]
> 176 kB is the first-load JS size, served compressed. On a modern laptop Wi-Fi connection (50+ Mbps), this loads in under 100ms. Subsequent navigations use the shared 87.6 kB chunk already cached.

---

## 2. Browser API Requirements

| API | Used By | Chrome | Edge | Firefox | Safari | Notes |
|-----|---------|--------|------|---------|--------|-------|
| `MediaDevices.getUserMedia` | CameraFeed.tsx | ✅ Full | ✅ Full | ✅ Full | ✅ Full | Requires HTTPS or localhost |
| `CanvasRenderingContext2D.getImageData` | CameraFeed, imageEnhance | ✅ | ✅ | ✅ | ✅ | Requires `willReadFrequently: true` hint (set) |
| `AudioContext` / `OscillatorNode` | alarmSound.ts | ✅ | ✅ | ✅ | ✅ | Requires user gesture to unlock |
| `IndexedDB` | syncQueue.ts | ✅ | ✅ | ✅ | ✅ | All modern browsers |
| `navigator.geolocation` | LiveFleetMap.tsx | ✅ | ✅ | ✅ | ✅ | Requires permission; HTTPS or localhost |
| `requestAnimationFrame` | CameraFeed.tsx | ✅ | ✅ | ✅ | ✅ | Universal |
| `WebAssembly` | MediaPipe FaceMesh | ✅ | ✅ | ✅ | ✅ 14.1+ | Required for MediaPipe CDN WASM |
| `performance.now()` | FPS counter | ✅ | ✅ | ✅ | ✅ | Universal |
| CSS `backdrop-filter` (blur) | Navbar, HUD badges | ✅ | ✅ | ✅ 103+ | ✅ 9+ | Used for HUD; degrades gracefully |
| ES2020 optional chaining (`?.`) | TypeScript output | ✅ | ✅ | ✅ 74+ | ✅ 13.1+ | Transpiled by Next.js for older targets |

---

## 3. Recommended Browser

**Google Chrome 120+** (Chromium) or **Microsoft Edge 120+**

Reasons:
- Best MediaPipe WASM performance
- Highest `getUserMedia` frame rate on laptops
- Best AudioContext stability
- Most commonly available on Windows laptops

**Firefox** is compatible for all features except MediaPipe may have slightly lower WASM performance.  
**Safari** is compatible but webcam frame rate may be lower; test on macOS if needed.

---

## 4. HTTPS / Localhost Requirement

`getUserMedia` and `navigator.geolocation` require a **secure context** (HTTPS or `localhost`).

| Environment | Secure? | Notes |
|-------------|---------|-------|
| `npm run dev` on localhost:3000 | ✅ Secure | localhost is treated as secure context |
| Vercel deployment (HTTPS) | ✅ Secure | Automatic SSL |
| Plain HTTP on a local IP (192.168.x.x) | ❌ Not secure | Camera/GPS will fail — use localhost instead |

---

## 5. Performance Estimates (Laptop)

| Metric | Estimate | Basis |
|--------|----------|-------|
| MediaPipe FaceMesh FPS | 20–30 FPS | Typical on Core i5/i7 laptop |
| Optical fallback FPS | 30+ FPS | Canvas pixel sampling only; very lightweight |
| Camera processing CPU | 15–35% | Varies by landmark model load |
| RAM usage (browser tab) | ~200–350 MB | MediaPipe WASM + Next.js hydration |
| Startup time (CDN MediaPipe) | 3–8 seconds | Depends on network speed |
| Startup time (offline fallback) | < 1 second | No CDN download needed |

> [!NOTE]
> These are estimates derived from MediaPipe documentation and Next.js bundle analysis. Actual values depend on the specific laptop CPU and available RAM.

---

## 6. Runtime Browser Tests (Manual Required)

The following tests **must be performed manually** before academic demonstration:

| Test | Procedure |
|------|-----------|
| Webcam starts and shows live video | Open Chrome → `/driver` → Allow camera |
| MediaPipe loads from CDN (connected) | Observe "🟢 MediaPipe" badge in HUD |
| Optical fallback activates (offline) | Disconnect internet → reload → observe "🟡 Optical Fallback" badge |
| EAR changes with eye state | Cover eyes with hand → EAR value drops below 0.21 |
| Drowsiness alert sounds | Keep eyes closed for 2+ seconds → audio beep/siren |
| Mute button silences alerts | Click mute in Navbar |
| GPS pin shown on map | Open `/moderator` or `/admin` → Allow location |
| Demo route labels visible | Confirm "[DEMO TRANSIT ROUTE WAYPOINT]" text on map |
| Login tab switching | Try Driver / Moderator / Admin tabs on `/login` |
| CSV export | `/reports` → Export button |

---

## 7. Known Browser-Specific Considerations

| Issue | Affected | Mitigation |
|-------|----------|-----------|
| AudioContext suspended until user gesture | All browsers | Interaction unlock listener added in `alarmSound.ts` |
| `getUserMedia` requires explicit permission | All browsers | Error overlay with retry button shown |
| MediaPipe CDN WASM blocked by some corporate firewalls | Chrome/Edge (restricted networks) | Optical luminosity fallback activates automatically |
| Safari WebRTC `getUserMedia` may default lower resolution | Safari | Ideal constraints set; actual resolution may vary |
| `backdrop-filter` not supported in very old Firefox | Firefox <70 | HUD badge still visible; blur effect omitted gracefully |
