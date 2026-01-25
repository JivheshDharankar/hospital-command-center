import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, 
  Settings, AlertTriangle, Info, CheckCircle, AlertCircle
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="w-4 h-4 text-destructive" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-500" />
};

const TYPE_COLORS: Record<string, string> = {
  alert: 'border-l-destructive',
  info: 'border-l-blue-500',
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500'
};

export default function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    preferences,
    loading,
    markAsRead, 
    markAllAsRead, 
    updatePreferences,
    requestPushPermission
  } = useNotifications();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      // Push permission granted
      console.log('Push notifications enabled');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="h-6 text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.slice(0, 10).map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DropdownMenuItem
                      className={cn(
                        "flex-col items-start p-3 cursor-pointer border-l-4",
                        TYPE_COLORS[notification.type],
                        !notification.read && "bg-muted/50"
                      )}
                      onClick={() => {
                        if (!notification.read) markAsRead(notification.id);
                        if (notification.action_url) {
                          window.location.href = notification.action_url;
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {TYPE_ICONS[notification.type]}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            !notification.read && "font-medium"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Configure how you receive notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Push Notifications */}
            <div className="space-y-4">
              <h4 className="font-medium">Push Notifications</h4>
              <Button onClick={handleEnablePush} variant="outline" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Enable Browser Notifications
              </Button>
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
              <h4 className="font-medium">Notification Types</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Hospital emergencies and critical events
                  </p>
                </div>
                <Switch
                  checked={preferences?.critical_alerts ?? true}
                  onCheckedChange={(checked) => updatePreferences({ critical_alerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Capacity Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Bed availability and occupancy alerts
                  </p>
                </div>
                <Switch
                  checked={preferences?.capacity_warnings ?? true}
                  onCheckedChange={(checked) => updatePreferences({ capacity_warnings: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transfer Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Inter-hospital transfer notifications
                  </p>
                </div>
                <Switch
                  checked={preferences?.transfer_requests ?? true}
                  onCheckedChange={(checked) => updatePreferences({ transfer_requests: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Patient Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Patient journey and status updates
                  </p>
                </div>
                <Switch
                  checked={preferences?.patient_updates ?? true}
                  onCheckedChange={(checked) => updatePreferences({ patient_updates: checked })}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
