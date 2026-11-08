# SAFE GUARD – Database Integration Results

**Date**: 2026-11-08 | **Database**: Supabase PostgreSQL

> [!WARNING]
> **Cloud Supabase integration is BLOCKED** — no live Supabase project credentials were available during this test session.  
> All cloud-dependent tests are classified as BLOCKED.  
> Local mock DB tests (which share the same interface) are classified as PASS where logic was verified by code analysis.

---

## 1. Schema Review

**Migration files**: `supabase/migrations/`

### Tables Defined

| Table | Purpose | RLS | Status |
|-------|---------|-----|--------|
| `profiles` | User profile + role (driver/moderator/admin) | ✅ Defined | ✅ Schema correct |
| `drivers` | Driver registration, assigned moderator | ✅ Defined | ✅ Schema correct |
| `vehicles` | Vehicle registration | ✅ Defined | ✅ Schema correct |
| `vehicle_assignments` | Driver ↔ Vehicle mapping | ✅ Defined | ✅ Schema correct (includes `created_at`) |
| `trips` | Trip records with start/end timestamps | ✅ Defined | ✅ Schema correct |
| `safety_events` | Drowsiness, distraction events per trip | ✅ Defined | ✅ Schema correct |
| `emergency_events` | Suspected collapse / abnormal motion events | ✅ Defined | ✅ Schema correct |
| `moderator_groups` | Moderator ↔ Driver group assignments | ✅ Defined | ✅ Schema correct |
| `notifications` | Real-time alert log | ✅ Defined | ✅ Schema correct |
| `audit_logs` | Admin action log | ✅ Defined | ✅ Schema correct |

### Key Columns Verified

| Column | Table | Type | Notes |
|--------|-------|------|-------|
| `driver_id` | trips, safety_events, emergency_events | `uuid REFERENCES profiles(id)` | FK enforced |
| `moderator_id` | moderator_groups | `uuid REFERENCES profiles(id)` | FK enforced |
| `created_at` | All tables | `timestamptz DEFAULT now()` | Auto-populated |
| `severity` | safety_events | `text CHECK (severity IN ('low','medium','high'))` | Constrained |
| `status` | emergency_events | `text DEFAULT 'active'` | Acknowledgement lifecycle |

---

## 2. Row Level Security (RLS) Policies

| Policy | Table | Rule | Status |
|--------|-------|------|--------|
| Drivers see only own trips | `trips` | `USING (driver_id = auth.uid())` | ✅ Defined in SQL |
| Drivers see only own events | `safety_events` | `USING (driver_id = auth.uid())` | ✅ Defined in SQL |
| Moderators see assigned group drivers | `trips`, `safety_events` | `USING (moderator_id = auth.uid())` via join | ✅ Defined in SQL |
| Admins have unrestricted access | All tables | Role check bypasses row filter | ✅ Defined in SQL |
| Drivers cannot modify other drivers' records | All tables | `WITH CHECK (driver_id = auth.uid())` | ✅ Defined in SQL |

> [!NOTE]
> RLS policies are defined in SQL migration files and are syntactically correct. They **cannot be verified as enforced** without a live Supabase project where policies are applied to an actual PostgreSQL instance.

### RLS Cloud Verification: 🚫 BLOCKED

Tests that require live Supabase:
- Attempt to read another driver's trip using authenticated driver token → expect 0 rows (RLS block)
- Attempt to INSERT an event for a different driver_id → expect RLS rejection
- Moderator attempting to access outside-group driver data → expect 0 rows
- Direct REST API call with no auth token → expect 401

These tests **must be conducted** with real Supabase credentials before production deployment.

---

## 3. Local Mock DB Tests

The `mockDb` module implements the same interface as the Supabase client. All application code that calls `db.trips.insert()`, `db.events.select()` etc. routes through this interface.

| Test | Result | Notes |
|------|--------|-------|
| Trip record created on session start | ✅ PASS | Mock insert returns generated UUID |
| Safety event inserted on DROWSY detection | ✅ PASS | Enqueue → mock insert pipeline verified |
| Emergency event inserted on suspected collapse | ✅ PASS | PoseEmergencyDetector → offlineSyncManager → mockDb |
| Event acknowledged (status: active → resolved) | ✅ PASS | Mock update call correct |
| Driver history query filters by driver_id | ✅ PASS | Mock SELECT with `.eq('driver_id', uid)` |
| Moderator query filters by group | ✅ PASS | Mock JOIN simulation |
| CSV export from report endpoint | ✅ PASS | `/api/reports` serialises mock data to CSV |

---

## 4. Supabase Realtime

| Feature | Status | Notes |
|---------|--------|-------|
| Channel subscription defined | ✅ Defined | `supabase.channel('safety_alerts').on('INSERT', ...)` |
| Moderator receives INSERT event | 🚫 BLOCKED | Requires live Supabase Realtime connection |
| Reconnection on channel drop | ⚠️ PARTIAL | Standard Supabase SDK handles reconnect; not verified live |

---

## 5. Offline Queue Integration

| Test | Result |
|------|--------|
| Events written to IndexedDB when Supabase unavailable | ✅ PASS |
| Queue drains on reconnection | ✅ PASS (source verified) |
| No duplicate writes (idempotency keys) | ✅ PASS |
| Queue depth shown in Navbar | ✅ PASS |

---

## 6. Environment Variables

| Variable | Present | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | In `.env.example` | Must be set in `.env.local` for cloud mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | In `.env.example` | Must be set in `.env.local` for cloud mode |
| `.env.local` committed to git | ❌ Not committed | Correctly excluded by `.gitignore` |

---

## 7. Summary

| Category | Tests | PASS | PARTIAL | BLOCKED |
|----------|-------|------|---------|---------|
| Schema review | 10 tables | 10 | 0 | 0 |
| RLS policy definition | 5 policies | 5 (defined) | 0 | 5 (enforced) |
| Mock DB integration | 7 | 7 | 0 | 0 |
| Cloud Supabase auth | 3 roles | 0 | 0 | 3 |
| Realtime | 2 | 0 | 1 | 1 |
| Offline queue | 4 | 4 | 0 | 0 |

**Cloud Supabase Status: BLOCKED / NOT VERIFIED**  
**Mock DB Status: PASS**  
**Schema & RLS definitions: PASS (syntactically correct SQL)**

