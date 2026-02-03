
# Remaining Implementation Plan

## Overview
Complete the MediQueue AI improvement plan by wiring up the new routes and updating navigation.

## Phase 1: Wire Up Routes in App.tsx

Update `src/App.tsx` to register all new protected routes:

```text
/admin       → AdminDashboard (requireAdmin)
/ambulance   → AmbulanceCenter (requireAdmin)  
/transfers   → TransferCenter (requireAdmin)
/analytics   → AnalyticsPage (authenticated)
/patients    → PatientTracking (authenticated)
```

Each admin route will be wrapped with `<ProtectedRoute requireAdmin>` and user routes with `<ProtectedRoute>`.

## Phase 2: Update Navbar Navigation

Transform the Navbar from anchor-based scrolling to proper React Router navigation:

1. **Split navigation into two types:**
   - Landing page anchors (Home, Symptom Checker, Nearby Hospitals, Contact)
   - App routes (Admin, Ambulance, Transfers, Analytics, Patients)

2. **Add role-based visibility:**
   - Admin links only visible when `isAdmin` is true
   - Use `useAuthContext()` hook in Navbar

3. **Use React Router's `Link` component:**
   - Replace `<a href="/admin">` with `<Link to="/admin">`
   - Handle mixed navigation (anchors + routes)

## Phase 3: Seed Remaining Data

Add the missing database records:
- **Notifications**: 8 sample alerts for admin users
- **Analytics Snapshots**: Generate 30 days of data for all 15 hospitals

## Phase 4: Enable Real-time Updates

Add Supabase Realtime subscriptions to:
- `useAmbulanceDispatch.ts` - Live ambulance position updates
- `useTransferRequests.ts` - Instant transfer request notifications
- `useNotifications.ts` - Real-time notification delivery

## Technical Details

### App.tsx Changes
```typescript
import AdminDashboard from "./pages/AdminDashboard";
import AmbulanceCenter from "./pages/AmbulanceCenter";
import TransferCenter from "./pages/TransferCenter";
import AnalyticsPage from "./pages/AnalyticsPage";
import PatientTracking from "./pages/PatientTracking";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Add routes:
<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <AdminDashboard />
  </ProtectedRoute>
} />
<Route path="/ambulance" element={
  <ProtectedRoute requireAdmin>
    <AmbulanceCenter />
  </ProtectedRoute>
} />
// ... etc
```

### Navbar Changes
- Import `Link` from `react-router-dom`
- Import `useAuthContext` for role checking
- Separate `routeLinks` from `anchorLinks`
- Conditionally render admin links

## Files to Modify
1. `src/App.tsx` - Add route definitions
2. `src/components/Navbar.tsx` - React Router links + role visibility
3. `src/hooks/useAmbulanceDispatch.ts` - Realtime subscription
4. `src/hooks/useTransferRequests.ts` - Realtime subscription

## Expected Outcome
- All new pages accessible via direct URLs
- Navbar shows appropriate links based on user role
- Real-time updates for operational features
- Complete sample data for demos
