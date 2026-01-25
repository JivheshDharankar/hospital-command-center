import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, Building2, Clock, Check, X, 
  MessageSquare, Send, Loader2, Plus, AlertTriangle,
  CheckCircle, XCircle
} from 'lucide-react';
import { useTransferRequests } from '@/hooks/useTransferRequests';
import { useHospitals } from '@/hooks/useHospitals';
import { useAuthContext } from '@/contexts/AuthContext';
import { SectionCard } from './SectionCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-destructive',
  'in-transit': 'bg-blue-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-gray-400'
};

const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-destructive',
  high: 'bg-amber-500',
  normal: 'bg-blue-500'
};

export default function HospitalTransfers() {
  const { 
    transfers,
    pendingTransfers, 
    activeTransfers, 
    loading,
    createTransferRequest,
    acceptTransfer,
    rejectTransfer,
    updateTransferStatus,
    getTransferMessages,
    sendMessage
  } = useTransferRequests();
  
  const { hospitals } = useHospitals();
  const { user, isAdmin } = useAuthContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; message: string; sender_id: string; created_at: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  
  const [newTransfer, setNewTransfer] = useState<{
    source_hospital_id: string;
    destination_hospital_id: string;
    patient_name: string;
    reason: string;
    urgency: 'critical' | 'high' | 'normal';
    specialty_needed: string;
  }>({
    source_hospital_id: '',
    destination_hospital_id: '',
    patient_name: '',
    reason: '',
    urgency: 'normal',
    specialty_needed: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (chatOpen) {
      getTransferMessages(chatOpen).then(setMessages);
    }
  }, [chatOpen, getTransferMessages]);

  const handleCreateTransfer = async () => {
    if (!newTransfer.source_hospital_id || !newTransfer.destination_hospital_id || !newTransfer.patient_name || !newTransfer.reason) return;
    
    setIsCreating(true);
    const result = await createTransferRequest({
      source_hospital_id: newTransfer.source_hospital_id,
      destination_hospital_id: newTransfer.destination_hospital_id,
      patient_name: newTransfer.patient_name,
      reason: newTransfer.reason,
      urgency: newTransfer.urgency,
      specialty_needed: newTransfer.specialty_needed || undefined
    });
    
    if (result) {
      setDialogOpen(false);
      setNewTransfer({
        source_hospital_id: '',
        destination_hospital_id: '',
        patient_name: '',
        reason: '',
        urgency: 'normal',
        specialty_needed: ''
      });
    }
    setIsCreating(false);
  };

  const handleSendMessage = async () => {
    if (!chatOpen || !newMessage.trim()) return;
    
    const result = await sendMessage(chatOpen, newMessage);
    if (result) {
      setMessages(prev => [...prev, result]);
      setNewMessage('');
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason) return;
    await rejectTransfer(rejectingId, rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  if (loading) {
    return (
      <SectionCard
        title="Inter-Hospital Transfers"
        subtitle="Loading transfer data..."
        icon={<ArrowRightLeft className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Inter-Hospital Transfers"
      subtitle="Manage patient transfers between hospitals"
      icon={<ArrowRightLeft className="w-6 h-6" />}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-500">{pendingTransfers.length}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-500">{activeTransfers.length}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-500">
            {transfers.filter(t => t.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">{transfers.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Transfer Requests</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Patient Transfer</DialogTitle>
              <DialogDescription>
                Submit a transfer request to another hospital
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>From Hospital</Label>
                <Select
                  value={newTransfer.source_hospital_id}
                  onValueChange={(value) => 
                    setNewTransfer(prev => ({ ...prev, source_hospital_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To Hospital</Label>
                <Select
                  value={newTransfer.destination_hospital_id}
                  onValueChange={(value) => 
                    setNewTransfer(prev => ({ ...prev, destination_hospital_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals
                      .filter(h => h.id !== newTransfer.source_hospital_id)
                      .map(hospital => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          <span className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              hospital.status === 'critical' ? 'bg-destructive' :
                              hospital.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                            )} />
                            {hospital.name} ({hospital.available_beds} beds)
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input
                  placeholder="Enter patient name"
                  value={newTransfer.patient_name}
                  onChange={(e) => setNewTransfer(prev => ({ 
                    ...prev, 
                    patient_name: e.target.value 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select
                  value={newTransfer.urgency}
                  onValueChange={(value: 'critical' | 'high' | 'normal') => 
                    setNewTransfer(prev => ({ ...prev, urgency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specialty Needed (Optional)</Label>
                <Input
                  placeholder="e.g., Cardiology, Neurology"
                  value={newTransfer.specialty_needed}
                  onChange={(e) => setNewTransfer(prev => ({ 
                    ...prev, 
                    specialty_needed: e.target.value 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Transfer Reason</Label>
                <Textarea
                  placeholder="Explain why transfer is needed..."
                  value={newTransfer.reason}
                  onChange={(e) => setNewTransfer(prev => ({ 
                    ...prev, 
                    reason: e.target.value 
                  }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTransfer}
                disabled={!newTransfer.source_hospital_id || !newTransfer.destination_hospital_id || !newTransfer.patient_name || !newTransfer.reason || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="pending">
            Pending ({pendingTransfers.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeTransfers.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({transfers.length})
          </TabsTrigger>
        </TabsList>

        {['pending', 'active', 'all'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                <AnimatePresence>
                  {(tab === 'pending' ? pendingTransfers : 
                    tab === 'active' ? activeTransfers : transfers
                  ).map((transfer, index) => {
                    const sourceHospital = hospitals.find(h => h.id === transfer.source_hospital_id);
                    const destHospital = hospitals.find(h => h.id === transfer.destination_hospital_id);
                    
                    return (
                      <motion.div
                        key={transfer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-premium p-4 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={URGENCY_COLORS[transfer.urgency]}>
                              {transfer.urgency}
                            </Badge>
                            <Badge className={STATUS_COLORS[transfer.status]}>
                              {transfer.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transfer.requested_at), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="font-medium">{transfer.patient_name}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span>{sourceHospital?.name || 'Unknown'}</span>
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{destHospital?.name || 'Unknown'}</span>
                        </div>

                        {transfer.specialty_needed && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Specialty: {transfer.specialty_needed}
                          </p>
                        )}

                        <p className="text-sm mt-2 line-clamp-2">{transfer.reason}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4">
                          {transfer.status === 'pending' && isAdmin && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => acceptTransfer(transfer.id)}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Dialog open={rejectingId === transfer.id} onOpenChange={(open) => !open && setRejectingId(null)}>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => setRejectingId(transfer.id)}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Transfer</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for rejection
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Reason for rejection..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setRejectingId(null)}>
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleReject}>
                                      Confirm Reject
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          {transfer.status === 'accepted' && isAdmin && (
                            <Button 
                              size="sm"
                              onClick={() => updateTransferStatus(transfer.id, 'in-transit')}
                            >
                              Start Transit
                            </Button>
                          )}

                          {transfer.status === 'in-transit' && isAdmin && (
                            <Button 
                              size="sm"
                              onClick={() => updateTransferStatus(transfer.id, 'completed')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setChatOpen(transfer.id)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>

                        {transfer.rejection_reason && (
                          <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                            <strong>Rejection reason:</strong> {transfer.rejection_reason}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {(tab === 'pending' ? pendingTransfers : 
                  tab === 'active' ? activeTransfers : transfers
                ).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transfers found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={!!chatOpen} onOpenChange={(open) => !open && setChatOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Communication</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] border rounded-lg p-4">
            <div className="space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    msg.sender_id === user?.id 
                      ? "ml-auto bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet
                </p>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
