import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface HospitalData {
  name: string;
  status: string;
  available_beds: number;
  total_beds: number;
  doctors_available: number;
  type: string;
}

interface PatientJourneyEvent {
  event_type: string;
  event_time: string;
  department?: string;
  details?: Record<string, unknown>;
}

interface AnalyticsSnapshot {
  snapshot_date: string;
  total_patients: number;
  avg_wait_minutes: number;
  occupancy_rate: number;
  critical_events: number;
}

// Brand colors as tuples
const BRAND_PRIMARY: [number, number, number] = [59, 130, 246]; // Blue
const BRAND_SECONDARY: [number, number, number] = [139, 92, 246]; // Purple
const TEXT_DARK: [number, number, number] = [31, 41, 55];
const TEXT_LIGHT: [number, number, number] = [107, 114, 128];

export async function generateHospitalOperationsPDF(hospitals: HospitalData[]): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with gradient effect
  doc.setFillColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo placeholder
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('MediQueue AI', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Hospital Operations Summary', 14, 32);
  
  // Timestamp
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 32, { align: 'right' });
  
  // Summary stats
  let yPos = 55;
  const totalBeds = hospitals.reduce((sum, h) => sum + h.total_beds, 0);
  const availableBeds = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
  const totalDoctors = hospitals.reduce((sum, h) => sum + h.doctors_available, 0);
  const occupancyRate = Math.round(((totalBeds - availableBeds) / totalBeds) * 100);
  
  // Stats cards
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, yPos, 45, 25, 3, 3, 'F');
  doc.roundedRect(64, yPos, 45, 25, 3, 3, 'F');
  doc.roundedRect(114, yPos, 45, 25, 3, 3, 'F');
  doc.roundedRect(164, yPos, 35, 25, 3, 3, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.text('Total Hospitals', 20, yPos + 8);
  doc.text('Available Beds', 70, yPos + 8);
  doc.text('Doctors On-Duty', 120, yPos + 8);
  doc.text('Occupancy', 170, yPos + 8);
  
  doc.setFontSize(16);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(hospitals.length.toString(), 20, yPos + 20);
  doc.text(`${availableBeds}/${totalBeds}`, 70, yPos + 20);
  doc.text(totalDoctors.toString(), 120, yPos + 20);
  doc.text(`${occupancyRate}%`, 170, yPos + 20);
  
  // Hospital table
  yPos = 95;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('Hospital Details', 14, yPos);
  
  yPos += 10;
  
  // Table header
  doc.setFillColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
  doc.rect(14, yPos, pageWidth - 28, 10, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Hospital Name', 18, yPos + 7);
  doc.text('Type', 90, yPos + 7);
  doc.text('Status', 120, yPos + 7);
  doc.text('Beds', 150, yPos + 7);
  doc.text('Doctors', 175, yPos + 7);
  
  yPos += 10;
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  hospitals.forEach((hospital, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 251);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.setFontSize(8);
    doc.text(hospital.name.substring(0, 35), 18, yPos + 5.5);
    doc.text(hospital.type, 90, yPos + 5.5);
    
    // Status badge
    const statusColor: [number, number, number] = hospital.status === 'Active' ? [34, 197, 94] : [234, 179, 8];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(118, yPos + 1.5, 20, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text(hospital.status, 128, yPos + 5, { align: 'center' });
    
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.setFontSize(8);
    doc.text(`${hospital.available_beds}/${hospital.total_beds}`, 150, yPos + 5.5);
    doc.text(hospital.doctors_available.toString(), 175, yPos + 5.5);
    
    yPos += 8;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
    doc.text(
      `Page ${i} of ${pageCount} | MediQueue AI - Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save('hospital-operations-summary.pdf');
}

export async function generatePatientJourneyPDF(
  patientName: string,
  events: PatientJourneyEvent[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(BRAND_SECONDARY[0], BRAND_SECONDARY[1], BRAND_SECONDARY[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('MediQueue AI', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Patient Journey Report', 14, 32);
  
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 32, { align: 'right' });
  
  // Patient info
  let yPos = 55;
  doc.setFontSize(14);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient: ${patientName}`, 14, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.text('Journey Timeline', 14, yPos);
  
  yPos += 10;
  
  // Timeline
  events.forEach((event, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    // Timeline dot
    doc.setFillColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
    doc.circle(20, yPos + 3, 3, 'F');
    
    // Timeline line
    if (index < events.length - 1) {
      doc.setDrawColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 6, 20, yPos + 25);
    }
    
    // Event content
    doc.setFontSize(10);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(event.event_type.replace(/_/g, ' ').toUpperCase(), 30, yPos + 4);
    
    doc.setFontSize(8);
    doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(event.event_time).toLocaleString(), 30, yPos + 10);
    
    if (event.department) {
      doc.text(`Department: ${event.department}`, 30, yPos + 16);
    }
    
    yPos += 25;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.text(
    'MediQueue AI - Patient Journey Report | Confidential Medical Document',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );
  
  doc.save(`patient-journey-${patientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

export async function generateAnalyticsPDF(
  snapshots: AnalyticsSnapshot[],
  chartElement?: HTMLElement
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(BRAND_PRIMARY[0], BRAND_PRIMARY[1], BRAND_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('MediQueue AI', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Analytics Report', 14, 32);
  
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 32, { align: 'right' });
  
  let yPos = 55;
  
  // Chart screenshot if available
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 14, yPos, imgWidth, Math.min(imgHeight, 100));
      yPos += Math.min(imgHeight, 100) + 15;
    } catch (error) {
      console.error('Failed to capture chart:', error);
    }
  }
  
  // Summary stats
  if (snapshots.length > 0) {
    const avgOccupancy = Math.round(
      snapshots.reduce((sum, s) => sum + s.occupancy_rate, 0) / snapshots.length
    );
    const avgWait = Math.round(
      snapshots.reduce((sum, s) => sum + s.avg_wait_minutes, 0) / snapshots.length
    );
    const totalCritical = snapshots.reduce((sum, s) => sum + s.critical_events, 0);
    
    doc.setFontSize(12);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Period Summary', 14, yPos);
    
    yPos += 10;
    
    // Stats grid
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, yPos, 85, 30, 3, 3, 'F');
    doc.roundedRect(104, yPos, 85, 30, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
    doc.text('Average Occupancy', 20, yPos + 10);
    doc.text('Average Wait Time', 110, yPos + 10);
    
    doc.setFontSize(18);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${avgOccupancy}%`, 20, yPos + 23);
    doc.text(`${avgWait} min`, 110, yPos + 23);
    
    yPos += 40;
    
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, yPos, 85, 30, 3, 3, 'F');
    doc.roundedRect(104, yPos, 85, 30, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Critical Events', 20, yPos + 10);
    doc.text('Data Points', 110, yPos + 10);
    
    doc.setFontSize(18);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(totalCritical.toString(), 20, yPos + 23);
    doc.text(snapshots.length.toString(), 110, yPos + 23);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(TEXT_LIGHT[0], TEXT_LIGHT[1], TEXT_LIGHT[2]);
  doc.text(
    'MediQueue AI - Analytics Report | Confidential',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );
  
  doc.save('analytics-report.pdf');
}

export async function captureElementAsImage(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}
