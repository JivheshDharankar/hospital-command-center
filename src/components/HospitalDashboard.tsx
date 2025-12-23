import { Hospital } from '@/types/hospital';
import { SectionCard } from './SectionCard';
import { StatusBadge } from './StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HospitalDashboardProps {
  hospitals: Hospital[];
}

export function HospitalDashboard({ hospitals }: HospitalDashboardProps) {
  return (
    <SectionCard
      id="dashboard"
      title="Hospital Resource Dashboard"
      subtitle="Used by operations teams to see which units are nearing capacity before it becomes a crisis."
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hospital</TableHead>
              <TableHead>Available Beds</TableHead>
              <TableHead>Doctors on Duty</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hospitals.map(hospital => (
              <TableRow key={hospital.id}>
                <TableCell className="font-medium">{hospital.name}</TableCell>
                <TableCell>{hospital.available_beds}</TableCell>
                <TableCell>{hospital.doctors_available}</TableCell>
                <TableCell>
                  <StatusBadge status={hospital.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Demo data only. In production, this would refresh from live hospital systems every few seconds.
      </p>
    </SectionCard>
  );
}
