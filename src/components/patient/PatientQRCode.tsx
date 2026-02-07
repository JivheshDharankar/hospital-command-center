import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Printer, Download, RefreshCw, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientQRCodeProps {
  journeyId: string;
  accessToken: string;
  patientName?: string;
  mrn?: string;
  department?: string;
  admittedAt?: string;
  onTokenRefresh?: (newToken: string) => void;
}

export function PatientQRCode({
  journeyId,
  accessToken,
  patientName,
  mrn,
  department,
  admittedAt,
  onTokenRefresh
}: PatientQRCodeProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const statusUrl = `${window.location.origin}/patient-status/${journeyId}?t=${accessToken}`;

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const newToken = crypto.randomUUID();
      const { error } = await supabase
        .from('patient_journeys')
        .update({ 
          access_token: newToken,
          qr_generated_at: new Date().toISOString()
        })
        .eq('id', journeyId);

      if (error) throw error;

      onTokenRefresh?.(newToken);
      toast({
        title: 'Token Refreshed',
        description: 'A new QR code has been generated.',
      });
    } catch (err) {
      console.error('Failed to refresh token:', err);
      toast({
        title: 'Error',
        description: 'Failed to refresh QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Check-In Card</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .card {
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 16px;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              margin: 20px 0;
            }
            .patient-name {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .info {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 4px;
            }
            .instructions {
              margin-top: 20px;
              padding: 12px;
              background: #f3f4f6;
              border-radius: 8px;
              font-size: 13px;
              color: #4b5563;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">MediQueue AI</div>
            <div class="qr-container">
              ${document.getElementById('patient-qr-svg')?.outerHTML || ''}
            </div>
            <div class="patient-name">${patientName || 'Patient'}</div>
            ${mrn ? `<div class="info">MRN: ${mrn}</div>` : ''}
            ${department ? `<div class="info">Department: ${department}</div>` : ''}
            ${admittedAt ? `<div class="info">Admitted: ${new Date(admittedAt).toLocaleDateString()}</div>` : ''}
            <div class="instructions">
              <strong>Scan to check your status</strong><br/>
              Use your phone camera to scan this QR code and view your real-time journey status.
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const svg = document.getElementById('patient-qr-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = `patient-qr-${journeyId.slice(0, 8)}.png`;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="w-4 h-4" />
          QR Check-In
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Patient Check-In QR Code</DialogTitle>
          <DialogDescription>
            Patient can scan this code to check their journey status
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-white rounded-2xl shadow-lg"
          >
            <QRCodeSVG
              id="patient-qr-svg"
              value={statusUrl}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: '/favicon.ico',
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </motion.div>

          <div className="mt-4 text-center">
            <p className="font-semibold">{patientName || 'Patient'}</p>
            {mrn && <p className="text-sm text-muted-foreground">MRN: {mrn}</p>}
            {department && <p className="text-sm text-muted-foreground">{department}</p>}
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshToken}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center max-w-[200px]">
            This QR code provides secure access to the patient's journey status page
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
