

# Fix All Issues Plan

## 1. Landing Page Cleanup (Performance + Architecture)

**Problem:** `Index.tsx` renders operational/admin components (`AdminPanel`, `AmbulanceDispatch`, `HospitalTransfers`, `PatientJourneyTimeline`, `HistoricalAnalytics`, `SurgeOrchestration`, `CohortFinder`) that should only exist on protected routes. Also, `getTotalOccupancy` is destructured but never used.

**Fix:**
- Remove all operational component imports and renders from `Index.tsx`
- Keep only public-facing components: `Hero`, `StatsGrid`, `QueueSimulation`, `Features`, `Departments`, `HospitalDashboard`, `HospitalMap`, `SymptomChecker`, `NearbyHospitals`, `SystemArchitecture`, `ContactForm`, `Footer`
- Remove unused `getTotalOccupancy` destructuring
- Add `React.lazy()` + `Suspense` for heavy components (`HospitalMap`, `HospitalDashboard`, `SymptomChecker`)

---

## 2. Fix Drag-and-Drop (Broken Logic)

**Problem:** In `ResourceAllocationDashboard.tsx`, the `DndContext` uses `closestCenter` collision detection. When a staff card is dropped, `over.id` resolves to another **staff card's ID** (since `SortableContext` items are staff IDs), not the department name. So `staffMember.current_department !== targetDept` always triggers with a staff UUID as the "target department."

**Fix:**
- Use `useDroppable` from `@dnd-kit/core` for each department column instead of relying on `SortableContext` alone
- Create a `DroppableDepartment` wrapper component that registers each department div as a droppable area with `id={dept.department}`
- In `handleDragEnd`, check if `over.id` matches a department name; if it matches a staff ID instead, look up which department that staff member belongs to and use the parent container

---

## 3. Fix PatientStatus for Unauthenticated Users

**Problem:** After fetching journey via the secure `get_journey_by_token` RPC (which works as a security definer function), the page queries `patients` and `journey_events` tables directly. These have RLS policies requiring authentication, so anonymous QR scans fail silently (patient data and events return null).

**Fix:**
- Create a new database function `get_patient_status_by_token(_journey_id uuid, _token uuid)` as `SECURITY DEFINER` that returns the journey data joined with patient name/MRN and journey events in a single call
- Replace the three separate queries in `PatientStatus.tsx` with a single RPC call
- This bypasses RLS safely since the token acts as the access control

---

## 4. Security Fixes

### 4a. Edge Function CORS Headers
**Problem:** `analyze-symptoms` has outdated CORS headers missing the extra Supabase client headers.

**Fix:** Update CORS headers in `analyze-symptoms/index.ts` to match the pattern used in `send-external-notification`.

### 4b. Analyze-Symptoms Auth
**Problem:** `analyze-symptoms` accepts a `user_id` from the client body with no server-side validation. Anyone can impersonate any user.

**Fix:** Add JWT validation using `getClaims()` pattern. Extract `user_id` from the token's `sub` claim instead of trusting client input. Allow unauthenticated use for anonymous triage but don't log a `user_id` unless verified.

### 4c. Contact Form Input Validation
**Problem:** No length limits on name, email, or organization fields. No server-side validation.

**Fix:** Add `maxLength` attributes to input fields and trim inputs before submission. Add Zod schema validation for email format and field lengths.

---

## 5. Code Quality Fixes

- Remove unused `AnimatePresence` import from `ResourceAllocationDashboard.tsx`
- Add an error boundary component wrapping the main app routes
- Add toast feedback on drag-and-drop reassignment success/failure in the Resource dashboard

---

## Technical Details

### New Database Migration
```sql
-- Security definer function for public patient status page
CREATE OR REPLACE FUNCTION public.get_patient_status_by_token(_journey_id uuid, _token uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'journey', row_to_json(pj),
    'patient', json_build_object('name', p.name, 'mrn', p.mrn),
    'events', COALESCE((
      SELECT json_agg(row_to_json(je) ORDER BY je.event_time DESC)
      FROM journey_events je WHERE je.journey_id = pj.id
    ), '[]'::json)
  ) INTO result
  FROM patient_journeys pj
  LEFT JOIN patients p ON p.id = pj.patient_id
  WHERE pj.id = _journey_id AND pj.access_token = _token;
  
  RETURN result;
END;
$$;
```

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove 7 operational components, add lazy loading, remove unused var |
| `src/components/ResourceAllocationDashboard.tsx` | Add `useDroppable` for department columns, fix drop target logic, remove unused imports |
| `src/pages/PatientStatus.tsx` | Replace 3 queries with single `get_patient_status_by_token` RPC |
| `supabase/functions/analyze-symptoms/index.ts` | Add JWT validation, fix CORS headers, extract user_id from token |
| `src/components/ContactForm.tsx` | Add maxLength, Zod validation |
| `src/App.tsx` | Add ErrorBoundary wrapper |
| New migration | `get_patient_status_by_token` function |

