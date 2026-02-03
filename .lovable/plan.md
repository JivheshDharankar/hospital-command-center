

# Fix All Issues Plan

## Issues Identified

### 1. Data Gaps (Critical for Demo)
| Table | Current | Required | Status |
|-------|---------|----------|--------|
| analytics_snapshots | 15 records | ~450 (30 days × 15 hospitals) | Missing |
| notifications | 0 records | 8+ sample alerts | Empty |
| transfer_requests | 1 record | 5+ for demo | Insufficient |

### 2. Landing Page Clutter
The Index page (`src/pages/Index.tsx`) still includes ALL operational components that should only appear on dedicated routes:
- `AmbulanceDispatch` (should only be on `/ambulance`)
- `HospitalTransfers` (should only be on `/transfers`)
- `PatientJourneyTimeline` (should only be on `/patients`)
- `HistoricalAnalytics` (should only be on `/analytics`)

This creates a cluttered landing page and defeats the purpose of the multi-page architecture.

### 3. AdminPanel Still on Landing Page
The `AdminPanel` component is still visible on the public landing page, which should be protected admin-only content.

### 4. Missing Realtime on transfer_requests Table
Unlike `ambulances` and `dispatch_requests`, the `transfer_requests` table is not added to the Supabase Realtime publication, so live updates won't work.

## Fix Plan

### Phase 1: Seed Missing Data

**1.1 Generate 30 days of analytics snapshots for all hospitals**
```sql
INSERT INTO analytics_snapshots (hospital_id, snapshot_date, occupancy_rate, total_patients, avg_wait_minutes, critical_events)
SELECT 
  h.id,
  d.date,
  60 + (random() * 35)::numeric(5,2),
  floor(50 + random() * 150)::integer,
  floor(15 + random() * 45)::integer,
  floor(random() * 5)::integer
FROM hospitals h
CROSS JOIN generate_series(CURRENT_DATE - 29, CURRENT_DATE, '1 day'::interval) AS d(date)
ON CONFLICT (hospital_id, snapshot_date) DO UPDATE SET
  occupancy_rate = EXCLUDED.occupancy_rate,
  total_patients = EXCLUDED.total_patients,
  avg_wait_minutes = EXCLUDED.avg_wait_minutes,
  critical_events = EXCLUDED.critical_events;
```

**1.2 Seed sample notifications**
Insert 8 notifications across different types (alert, info, success, warning) with action URLs pointing to operational pages.

**1.3 Add more transfer requests**
Insert 4-5 additional transfer requests with varying urgency levels and statuses.

### Phase 2: Clean Up Landing Page

**2.1 Remove operational components from Index.tsx**

Remove these imports and component usages:
- `AmbulanceDispatch`
- `HospitalTransfers`
- `PatientJourneyTimeline`
- `HistoricalAnalytics`
- `AdminPanel`

The landing page should focus on:
- Hero + StatsGrid
- QueueSimulation (demo)
- Features + Departments
- HospitalDashboard + HospitalMap
- SurgeOrchestration + CohortFinder (public analytics preview)
- SymptomChecker + NearbyHospitals (patient tools)
- SystemArchitecture + ContactForm

### Phase 3: Enable Realtime for transfer_requests

**3.1 Add migration to enable realtime**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfer_requests;
```

This ensures the Supabase Realtime subscription in `useTransferRequests.ts` actually works.

## Files to Modify

1. **Database**: Seed analytics_snapshots, notifications, transfer_requests
2. **Database Migration**: Enable realtime on transfer_requests
3. **src/pages/Index.tsx**: Remove operational components (AmbulanceDispatch, HospitalTransfers, PatientJourneyTimeline, HistoricalAnalytics, AdminPanel)

## Expected Outcome

- Historical Analytics charts show 30 days of meaningful trend data
- Notification Center displays sample alerts with clickable action links
- Transfer Center shows multiple pending/active transfers
- Landing page is clean and focused on public demo features
- Real-time updates work for all operational tables

