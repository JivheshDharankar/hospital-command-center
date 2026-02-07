import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Users, RefreshCw, UserCheck, UserX, Clock,
  Stethoscope, Activity, AlertTriangle, GripVertical
} from 'lucide-react';
import { useStaffAllocation, Staff } from '@/hooks/useStaffAllocation';
import { SectionCard } from './SectionCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  doctor: <Stethoscope className="w-3 h-3" />,
  nurse: <UserCheck className="w-3 h-3" />,
  technician: <Activity className="w-3 h-3" />
};

const ROLE_COLORS: Record<string, string> = {
  doctor: 'bg-blue-500',
  nurse: 'bg-emerald-500',
  technician: 'bg-purple-500'
};

interface StaffCardProps {
  staff: Staff;
  isDragging?: boolean;
}

function StaffCard({ staff, isDragging }: StaffCardProps) {
  const initials = staff.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-card border border-border transition-all",
        isDragging && "shadow-lg ring-2 ring-primary opacity-90"
      )}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
      <Avatar className="w-8 h-8">
        <AvatarFallback className={cn("text-xs text-white", ROLE_COLORS[staff.role])}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{staff.name}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {ROLE_ICONS[staff.role]}
          <span className="capitalize">{staff.role}</span>
          {staff.specialty && <span>• {staff.specialty}</span>}
        </div>
      </div>
    </div>
  );
}

function SortableStaffCard({ staff }: { staff: Staff }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: staff.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StaffCard staff={staff} isDragging={isDragging} />
    </div>
  );
}

export default function ResourceAllocationDashboard() {
  const {
    staff,
    assignments,
    loading,
    reassignStaff,
    getStaffByDepartment,
    getStaffingStatus,
    refetch
  } = useStaffAllocation();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingReassignment, setPendingReassignment] = useState<{
    staffId: string;
    staffName: string;
    fromDept: string | null;
    toDept: string;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const departmentStaffing = getStaffByDepartment();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const staffMember = staff.find(s => s.id === active.id);
    const targetDept = over.id as string;

    if (staffMember && staffMember.current_department !== targetDept) {
      setPendingReassignment({
        staffId: staffMember.id,
        staffName: staffMember.name,
        fromDept: staffMember.current_department,
        toDept: targetDept
      });
    }
  };

  const handleConfirmReassignment = async () => {
    if (!pendingReassignment) return;

    const success = await reassignStaff(
      pendingReassignment.staffId,
      pendingReassignment.toDept,
      reason || undefined
    );

    if (success) {
      setPendingReassignment(null);
      setReason('');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const activeStaff = activeId ? staff.find(s => s.id === activeId) : null;

  const getStatusColor = (status: 'adequate' | 'stretched' | 'understaffed'): string => {
    switch (status) {
      case 'adequate': return 'text-emerald-500';
      case 'stretched': return 'text-amber-500';
      case 'understaffed': return 'text-red-500';
    }
  };

  const getStatusIcon = (status: 'adequate' | 'stretched' | 'understaffed'): string => {
    switch (status) {
      case 'adequate': return '🟢';
      case 'stretched': return '🟡';
      case 'understaffed': return '🔴';
    }
  };

  if (loading) {
    return (
      <SectionCard
        title="Resource Allocation"
        subtitle="Loading staff data..."
        icon={<Users className="w-6 h-6" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Resource Allocation Dashboard"
      subtitle="Drag and drop staff between departments during surge scenarios"
      icon={<Users className="w-6 h-6" />}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            🟢 <span className="text-muted-foreground">Adequate</span>
          </span>
          <span className="flex items-center gap-1">
            🟡 <span className="text-muted-foreground">Stretched</span>
          </span>
          <span className="flex items-center gap-1">
            🔴 <span className="text-muted-foreground">Understaffed</span>
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Department Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {departmentStaffing.map((dept) => {
            const status = getStaffingStatus(dept.current, dept.recommended);
            
            return (
              <div
                key={dept.department}
                id={dept.department}
                className="glass-premium rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm truncate">{dept.department}</h4>
                  <span className="text-lg">{getStatusIcon(status)}</span>
                </div>
                
                <div className={cn("text-sm font-medium mb-3", getStatusColor(status))}>
                  {dept.current}/{dept.recommended} staff
                </div>

                <ScrollArea className="h-[200px]">
                  <SortableContext
                    items={dept.staff.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {dept.staff.map((s) => (
                        <SortableStaffCard key={s.id} staff={s} />
                      ))}
                      
                      {dept.staff.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <UserX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          No staff assigned
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeStaff && <StaffCard staff={activeStaff} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Recent Reassignments */}
      {assignments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Reassignments
          </h4>
          <div className="space-y-2">
            {assignments.slice(0, 5).map((assignment) => {
              const staffMember = staff.find(s => s.id === assignment.staff_id);
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="font-medium text-foreground">
                    {staffMember?.name || 'Unknown'}
                  </span>
                  <span>:</span>
                  <span>{assignment.from_department || 'Unassigned'}</span>
                  <span>→</span>
                  <span className="font-medium">{assignment.to_department}</span>
                  <span className="text-xs">
                    ({formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })})
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingReassignment} onOpenChange={() => setPendingReassignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Staff Reassignment</DialogTitle>
            <DialogDescription>
              Move {pendingReassignment?.staffName} from{' '}
              <strong>{pendingReassignment?.fromDept || 'Unassigned'}</strong> to{' '}
              <strong>{pendingReassignment?.toDept}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Surge in Emergency department"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingReassignment(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReassignment}>
              Confirm Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
