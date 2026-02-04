

# Fix All Data Gaps Plan

## Current State

| Table | Records | Issue |
|-------|---------|-------|
| analytics_snapshots | 15 (single day) | Need 30 days of trends |
| notifications | 0 | No alerts for demo |
| transfer_requests | 1 (completed) | Need active/pending transfers |

## Phase 1: Seed Analytics Snapshots (30 days × 15 hospitals)

Generate realistic historical data with daily variations:

```sql
INSERT INTO analytics_snapshots (hospital_id, snapshot_date, occupancy_rate, total_patients, avg_wait_minutes, critical_events)
SELECT 
  h.id,
  d.date::date,
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

This creates ~450 records with:
- Occupancy rates between 60-95%
- Patient counts between 50-200
- Wait times between 15-60 minutes
- 0-4 critical events per day

## Phase 2: Seed Sample Notifications

Insert 8 notifications for the admin user with action URLs:

| Type | Title | Action URL |
|------|-------|------------|
| alert | Critical Capacity at Ruby Hall | /admin |
| warning | Transfer Request Pending | /transfers |
| info | New Patient Journey Started | /patients |
| success | Ambulance Dispatch Completed | /ambulance |
| alert | ICU Surge Detected | /analytics |
| warning | High Wait Times in Emergency | /admin |
| info | System Maintenance Scheduled | null |
| success | Transfer Completed Successfully | /transfers |

## Phase 3: Seed Transfer Requests

Add 5 new transfer requests with varying statuses:

| Patient | Source Hospital | Destination | Urgency | Status |
|---------|-----------------|-------------|---------|--------|
| Amit Sharma | Ruby Hall | Sahyadri | critical | pending |
| Priya Patel | KEM Hospital | Jehangir | high | accepted |
| Rajesh Kumar | Noble Hospital | Columbia Asia | normal | in-transit |
| Sneha Desai | Bharati | Sassoon | high | pending |
| Vikram Singh | Poona Hospital | Aditya Birla | critical | pending |

## Execution

All data will be inserted via the Supabase insert tool in a single operation, using the actual hospital IDs and user ID from the database.

## Expected Outcome

- Historical Analytics page shows 30-day trend charts with meaningful data
- Notification Center displays 8 sample alerts with clickable action links
- Transfer Center shows 5 pending/active transfers for demo purposes
- All features become fully demonstrable

