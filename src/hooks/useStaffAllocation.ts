import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Staff {
  id: string;
  hospital_id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'technician';
  specialty: string | null;
  current_department: string | null;
  status: 'on-duty' | 'off-duty' | 'on-call' | 'break';
  shift_start: string | null;
  shift_end: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface StaffAssignment {
  id: string;
  staff_id: string;
  from_department: string | null;
  to_department: string;
  assigned_by: string | null;
  reason: string | null;
  effective_at: string;
  created_at: string;
}

interface DepartmentStaffing {
  department: string;
  staff: Staff[];
  recommended: number;
  current: number;
}

export function useStaffAllocation(hospitalId?: string) {
  const { user } = useAuthContext();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    let query = supabase.from('staff').select('*').order('name');
    
    if (hospitalId) {
      query = query.eq('hospital_id', hospitalId);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching staff:', fetchError);
      setError(fetchError.message);
      return;
    }

    setStaff((data || []).map(s => ({
      id: s.id,
      hospital_id: s.hospital_id,
      name: s.name,
      role: s.role as Staff['role'],
      specialty: s.specialty,
      current_department: s.current_department,
      status: s.status as Staff['status'],
      shift_start: s.shift_start,
      shift_end: s.shift_end,
      phone: s.phone,
      avatar_url: s.avatar_url,
      created_at: s.created_at
    })));
  }, [hospitalId]);

  const fetchRecentAssignments = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('staff_assignments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error('Error fetching assignments:', fetchError);
      return;
    }

    setAssignments((data || []).map(a => ({
      id: a.id,
      staff_id: a.staff_id,
      from_department: a.from_department,
      to_department: a.to_department,
      assigned_by: a.assigned_by,
      reason: a.reason,
      effective_at: a.effective_at,
      created_at: a.created_at
    })));
  }, []);

  useEffect(() => {
    Promise.all([fetchStaff(), fetchRecentAssignments()])
      .finally(() => setLoading(false));

    // Real-time subscriptions
    const staffChannel = supabase
      .channel('staff_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        fetchStaff();
      })
      .subscribe();

    const assignmentChannel = supabase
      .channel('assignment_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_assignments' }, () => {
        fetchRecentAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(staffChannel);
      supabase.removeChannel(assignmentChannel);
    };
  }, [fetchStaff, fetchRecentAssignments]);

  const reassignStaff = useCallback(async (
    staffId: string,
    toDepartment: string,
    reason?: string
  ): Promise<boolean> => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return false;

    const fromDepartment = staffMember.current_department;

    // Update staff department
    const { error: updateError } = await supabase
      .from('staff')
      .update({ 
        current_department: toDepartment,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId);

    if (updateError) {
      console.error('Error reassigning staff:', updateError);
      setError(updateError.message);
      return false;
    }

    // Record assignment for audit trail
    const { error: assignError } = await supabase
      .from('staff_assignments')
      .insert({
        staff_id: staffId,
        from_department: fromDepartment,
        to_department: toDepartment,
        assigned_by: user?.id || null,
        reason: reason || null
      });

    if (assignError) {
      console.error('Error recording assignment:', assignError);
      // Non-fatal, update still succeeded
    }

    return true;
  }, [staff, user?.id]);

  const getStaffByDepartment = useCallback((): DepartmentStaffing[] => {
    const departments = ['Emergency', 'ICU', 'General Ward', 'OPD', 'Cardiology', 'Neurology'];
    const recommendedPerDept: Record<string, number> = {
      'Emergency': 8,
      'ICU': 6,
      'General Ward': 4,
      'OPD': 5,
      'Cardiology': 4,
      'Neurology': 4
    };

    return departments.map(dept => {
      const deptStaff = staff.filter(s => s.current_department === dept && s.status === 'on-duty');
      return {
        department: dept,
        staff: deptStaff,
        current: deptStaff.length,
        recommended: recommendedPerDept[dept] || 4
      };
    });
  }, [staff]);

  const getStaffingStatus = useCallback((current: number, recommended: number): 'adequate' | 'stretched' | 'understaffed' => {
    const ratio = current / recommended;
    if (ratio >= 0.9) return 'adequate';
    if (ratio >= 0.6) return 'stretched';
    return 'understaffed';
  }, []);

  const updateStaffStatus = useCallback(async (
    staffId: string,
    status: Staff['status']
  ): Promise<boolean> => {
    const { error: updateError } = await supabase
      .from('staff')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId);

    if (updateError) {
      console.error('Error updating staff status:', updateError);
      return false;
    }

    return true;
  }, []);

  return {
    staff,
    assignments,
    loading,
    error,
    reassignStaff,
    getStaffByDepartment,
    getStaffingStatus,
    updateStaffStatus,
    refetch: fetchStaff
  };
}
