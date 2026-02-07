
# Implementation Plan: Advanced Technical Features (6-10)

This plan outlines five advanced technical features that will elevate MediQueue AI with real-time tracking, external integrations, AI predictions, and operational efficiency tools.

---

## Overview

| Feature | Impact | Complexity | Estimated Effort |
|---------|--------|------------|------------------|
| 6. Real-Time Ambulance GPS Tracking | Very High | High | 4-5 hours |
| 7. WhatsApp/SMS Integration | High | Medium | 3-4 hours |
| 8. AI Wait Time Prediction | High | High | 4-5 hours |
| 9. QR Code Patient Check-In | Medium | Medium | 2-3 hours |
| 10. Resource Allocation Dashboard | Very High | High | 5-6 hours |

---

## Feature 6: Real-Time Ambulance GPS Tracking on Map

Enhance the HospitalMap component to show live ambulance positions with animated routes to destination hospitals.

### Current State
- `useAmbulanceDispatch` hook tracks ambulances with `current_lat/current_lng` fields
- `AmbulanceDispatch` component shows ambulances on a separate map with static markers
- Realtime updates already configured for `ambulances` table

### Implementation Steps

1. **Create Animated Route Component**
   - New file: `src/components/map/AnimatedRoute.tsx`
   - Use Leaflet Polyline with animated dash-array effect
   - Calculate route between ambulance position and destination hospital
   - Update route points in real-time as ambulance moves

2. **Enhance HospitalMap Component**
   - Add ambulance markers with custom animated icons
   - Show connecting routes for active dispatches
   - Display ETA and status overlay on hover
   - Add toggle control to show/hide ambulances

3. **GPS Simulation Service (Demo Mode)**
   - Create `src/services/gpsSimulator.ts`
   - Simulate ambulance movement along routes for demonstrations
   - Update positions via `updateAmbulancePosition` hook method

4. **Real-Time Route Updates**
   - Subscribe to `dispatch_requests` table changes
   - Animate route appearance/disappearance on status changes
   - Show pulse effect at pickup and destination points

### Technical Details

```text
New Components:
├── src/components/map/
│   ├── AnimatedRoute.tsx      # Animated polyline route
│   ├── AmbulanceMarker.tsx    # Custom animated ambulance marker
│   └── RouteInfo.tsx          # Popup with ETA and status

Hook Modifications:
└── src/hooks/useAmbulanceDispatch.ts
    └── Add: simulateMovement(), getRouteCoordinates()
```

### Visual Features
- Ambulance icons with directional rotation based on heading
- Animated dashed line showing route to hospital
- Color-coded routes (red=critical, amber=high, blue=normal)
- ETA countdown overlay near ambulance marker
- Pulse animation at origin and destination points

---

## Feature 7: WhatsApp/SMS Alert Integration

Send critical notifications via WhatsApp or SMS for staff who aren't logged into the app.

### Approach
Use Twilio for SMS and WhatsApp API integration. Create a backend edge function to handle message dispatch with templates for different alert types.

### Database Changes

```sql
-- Add phone column to profiles for SMS/WhatsApp notifications
ALTER TABLE profiles ADD COLUMN phone_number TEXT;
ALTER TABLE profiles ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN sms_enabled BOOLEAN DEFAULT false;

-- Track sent messages
CREATE TABLE external_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'sms' | 'whatsapp'
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'failed' | 'delivered'
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);
```

### Implementation Steps

1. **Create Edge Function for Message Dispatch**
   - New file: `supabase/functions/send-external-notification/index.ts`
   - Support both Twilio SMS and WhatsApp Business API
   - Message templates for: critical alerts, capacity warnings, transfer requests

2. **Add Notification Preferences UI**
   - Extend `NotificationCenter.tsx` settings dialog
   - Phone number input with verification
   - Toggle switches for SMS/WhatsApp channels
   - Test notification button

3. **Trigger External Notifications**
   - Create database trigger on `hospital_alerts` table for critical events
   - Extend `notifications` insert to optionally trigger external channels
   - Rate limiting to prevent spam

4. **Message Templates**

```text
[CRITICAL] MediQueue AI Alert
Hospital: {hospital_name}
Status: Critical Capacity
Available Beds: {beds}
Action Required: Review patient transfers

Reply STOP to unsubscribe
```

### Secrets Required
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_WHATSAPP_NUMBER` (optional)

---

## Feature 8: AI-Powered Wait Time Prediction

Use historical data to predict ER wait times for each hospital using AI analysis.

### Approach
Create an edge function that leverages Lovable AI (Gemini) to analyze historical patterns in `analytics_snapshots` and predict future wait times based on current conditions.

### Implementation Steps

1. **Create Prediction Edge Function**
   - New file: `supabase/functions/predict-wait-times/index.ts`
   - Fetch last 30 days of `analytics_snapshots`
   - Analyze patterns: day of week, time of day, occupancy correlation
   - Use Gemini to generate predictions with confidence intervals

2. **Create Prediction Hook**
   - New file: `src/hooks/useWaitTimePrediction.ts`
   - Fetch predictions per hospital
   - Cache predictions with TTL (refresh every 15 minutes)
   - Return: predicted wait, confidence level, trend direction

3. **Enhance Hospital Cards with Predictions**
   - Add predicted wait time badge to `HospitalDashboard.tsx`
   - Show trend indicator (up/down/stable)
   - Display confidence level as visual indicator
   - Tooltip with prediction reasoning

4. **Prediction Model Logic**

```text
Input Features:
- Current occupancy rate
- Day of week + hour
- Historical wait times (same day/time)
- Recent trend (last 4 hours)
- Critical event count

Output:
- Predicted wait time (minutes)
- Confidence (low/medium/high)
- Trend direction
- Suggested actions
```

### UI Integration
- Add to `HospitalMap.tsx` popup with predicted wait
- Add to `HospitalDashboard.tsx` as secondary stat
- New "Predictions" tab in `HistoricalAnalytics.tsx`

---

## Feature 9: QR Code Patient Check-In

Generate QR codes for patients that link to their journey status, reducing front-desk bottlenecks.

### Implementation Steps

1. **Add QR Code Library**
   - Install `qrcode.react` for generation
   - No backend changes needed

2. **Create QR Generator Component**
   - New file: `src/components/patient/PatientQRCode.tsx`
   - Generate unique URL: `/patient-status/{journey_id}?token={secure_token}`
   - Display patient name and admission info
   - Print-friendly layout

3. **Create Public Status Page**
   - New file: `src/pages/PatientStatus.tsx`
   - No authentication required (uses secure token)
   - Shows: current department, estimated wait, journey timeline
   - Real-time updates via Supabase realtime

4. **Database Changes**

```sql
-- Add secure access token to patient_journeys
ALTER TABLE patient_journeys ADD COLUMN access_token UUID DEFAULT gen_random_uuid();
ALTER TABLE patient_journeys ADD COLUMN qr_generated_at TIMESTAMPTZ;

-- RLS policy for public access with token
CREATE POLICY "Public can view journey with token"
ON patient_journeys FOR SELECT
USING (access_token = current_setting('request.headers')::json->>'x-access-token');
```

5. **Integrate into Patient Journey Flow**
   - Add "Generate QR" button to `PatientJourneyTimeline.tsx`
   - Print dialog with QR code and patient info
   - Regenerate token option for security

### QR Code Content
```text
URL: https://app.mediqueue.ai/s/{journey_id}?t={access_token}

Printed Card Contains:
- Patient Name
- MRN
- Admission Date
- QR Code
- Instructions: "Scan to check your status"
```

---

## Feature 10: Resource Allocation Dashboard

Visualize doctor/nurse allocation across departments with drag-and-drop reassignment during surge scenarios.

### Database Changes

```sql
-- Staff table to track individual staff members
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'doctor' | 'nurse' | 'technician'
  specialty TEXT,
  current_department TEXT,
  status TEXT DEFAULT 'on-duty', -- 'on-duty' | 'off-duty' | 'on-call' | 'break'
  shift_start TIMESTAMPTZ,
  shift_end TIMESTAMPTZ,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track reassignments for audit
CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) NOT NULL,
  from_department TEXT,
  to_department TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  reason TEXT,
  effective_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_assignments;
```

### Implementation Steps

1. **Create Staff Management Hook**
   - New file: `src/hooks/useStaffAllocation.ts`
   - CRUD operations for staff
   - Real-time subscription for live updates
   - Department-grouped staff queries

2. **Create Resource Dashboard Component**
   - New file: `src/components/ResourceAllocationDashboard.tsx`
   - Grid layout with departments as columns
   - Staff cards as draggable items
   - Drag-and-drop using native HTML5 DnD or `@dnd-kit/core`

3. **Department Capacity Visualization**
   - Show current vs. recommended staffing levels
   - Color coding: green (adequate), amber (stretched), red (understaffed)
   - Surge indicator when above threshold

4. **Reassignment Flow**
   - Drag staff card from one department to another
   - Confirmation dialog with reason input
   - Audit trail in `staff_assignments` table
   - Optional notification to reassigned staff

5. **Create Protected Page**
   - New route: `/resources`
   - Add to admin navigation
   - Protected with admin role requirement

### UI Design

```text
┌──────────────────────────────────────────────────────────────────┐
│ Resource Allocation Dashboard                          [Refresh] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Emergency   │  │ Cardiology  │  │ Neurology   │  │ General │ │
│  │ 🟢 6/8      │  │ 🟡 3/5      │  │ 🔴 2/4      │  │ 🟢 4/4  │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────┤ │
│  │ [Dr. Patel] │  │ [Dr. Shah]  │  │ [Dr. Kumar] │  │ [Dr. X] │ │
│  │ [Dr. Gupta] │  │ [Nr. Singh] │  │ [Nr. Joshi] │  │ [Nr. Y] │ │
│  │ [Nr. Mehta] │  │             │  │             │  │         │ │
│  │ [Nr. Rao]   │  │   [DROP]    │  │   [DROP]    │  │ [DROP]  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                  │
│  Recent Reassignments:                                           │
│  • Dr. Patel: General → Emergency (10 min ago)                   │
│  • Nr. Singh: Emergency → Cardiology (25 min ago)                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

Recommended execution order based on dependencies and impact:

1. **QR Code Patient Check-In** (2-3 hours)
   - Independent feature, quick win
   - Adds patient-facing value

2. **AI Wait Time Prediction** (4-5 hours)
   - Builds on existing analytics infrastructure
   - High visibility feature

3. **Real-Time Ambulance GPS Tracking** (4-5 hours)
   - Enhances existing ambulance system
   - Very impressive for demonstrations

4. **Resource Allocation Dashboard** (5-6 hours)
   - Requires new database tables
   - High operational value

5. **WhatsApp/SMS Integration** (3-4 hours)
   - Requires external API keys (Twilio)
   - Best implemented last due to external dependencies

---

## Technical Requirements Summary

### New Dependencies
- `qrcode.react` - QR code generation
- `@dnd-kit/core` - Drag and drop for resource allocation

### New Edge Functions
- `supabase/functions/predict-wait-times/index.ts`
- `supabase/functions/send-external-notification/index.ts`

### Database Migrations
- Add columns to `profiles` (phone, WhatsApp enabled)
- Add columns to `patient_journeys` (access_token)
- Create `external_notifications` table
- Create `staff` and `staff_assignments` tables

### Secrets Required (for WhatsApp/SMS)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### New Pages/Routes
- `/patient-status/:journeyId` - Public patient status page
- `/resources` - Resource allocation dashboard (admin only)

---

## Success Metrics

After implementation:
- **Ambulance Tracking**: Dispatchers can see real-time fleet positions with animated routes
- **External Alerts**: Staff receive critical notifications even when offline
- **Wait Predictions**: Patients and staff can see AI-predicted wait times
- **QR Check-In**: Patients can self-serve status checks, reducing front-desk load
- **Resource Dashboard**: Administrators can visually reassign staff during surges

These features transform MediQueue AI into a comprehensive hospital operations platform with real-world utility beyond demonstration.
