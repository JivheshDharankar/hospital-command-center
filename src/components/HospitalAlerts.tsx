import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, X, CheckCircle, Bell } from 'lucide-react';

interface HospitalAlert {
  id: string;
  hospital_id: string;
  alert_type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bgClass: 'bg-destructive/10 border-destructive/30',
    textClass: 'text-destructive',
    badgeVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-600 dark:text-yellow-400',
    badgeVariant: 'secondary' as const,
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-600 dark:text-blue-400',
    badgeVariant: 'outline' as const,
  },
};

export function HospitalAlerts() {
  const [alerts, setAlerts] = useState<HospitalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time alerts
    const channel = supabase
      .channel('hospital-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hospital_alerts',
        },
        (payload) => {
          const newAlert = payload.new as HospitalAlert;
          setAlerts((prev) => [newAlert, ...prev]);
          
          // Show toast for new alerts
          toast({
            title: `New ${newAlert.severity.toUpperCase()} Alert`,
            description: newAlert.message,
            variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hospital_alerts',
        },
        (payload) => {
          const updatedAlert = payload.new as HospitalAlert;
          setAlerts((prev) =>
            prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts((data || []).map(a => ({
        ...a,
        severity: a.severity as 'info' | 'warning' | 'critical'
      })));
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('hospital_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast({
        title: 'Alert Acknowledged',
        description: 'The alert has been marked as acknowledged.',
      });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert.',
        variant: 'destructive',
      });
    }
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter((a) => a.severity === 'critical');

  if (loading) return null;
  if (unacknowledgedAlerts.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-4">
      <AnimatePresence>
        {criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">
                    {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Immediate attention required
                  </p>
                </div>
              </div>
              <Badge variant="destructive" className="animate-pulse">
                CRITICAL
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Active Alerts</h2>
          <Badge variant="outline">{unacknowledgedAlerts.length}</Badge>
        </div>

        <AnimatePresence mode="popLayout">
          {unacknowledgedAlerts.slice(0, 5).map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-lg border ${config.bgClass} backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${config.bgClass}`}>
                      <Icon className={`w-4 h-4 ${config.textClass}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={config.badgeVariant} className="text-xs">
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="shrink-0"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
