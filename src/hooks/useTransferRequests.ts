import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface TransferRequest {
  id: string;
  source_hospital_id: string;
  destination_hospital_id: string;
  patient_journey_id: string | null;
  patient_name: string;
  reason: string;
  urgency: 'critical' | 'high' | 'normal';
  specialty_needed: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'in-transit' | 'completed' | 'cancelled';
  requested_by: string | null;
  responded_by: string | null;
  requested_at: string;
  responded_at: string | null;
  completed_at: string | null;
  rejection_reason: string | null;
}

interface TransferCommunication {
  id: string;
  transfer_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  created_at: string;
}

interface CreateTransferRequest {
  source_hospital_id: string;
  destination_hospital_id: string;
  patient_name: string;
  reason: string;
  urgency?: 'critical' | 'high' | 'normal';
  specialty_needed?: string;
  patient_journey_id?: string;
}

interface UseTransferRequestsReturn {
  transfers: TransferRequest[];
  pendingTransfers: TransferRequest[];
  activeTransfers: TransferRequest[];
  loading: boolean;
  error: string | null;
  createTransferRequest: (request: CreateTransferRequest) => Promise<TransferRequest | null>;
  acceptTransfer: (transferId: string) => Promise<void>;
  rejectTransfer: (transferId: string, reason: string) => Promise<void>;
  updateTransferStatus: (transferId: string, status: TransferRequest['status']) => Promise<void>;
  getTransferMessages: (transferId: string) => Promise<TransferCommunication[]>;
  sendMessage: (transferId: string, message: string) => Promise<TransferCommunication | null>;
}

const mapTransfer = (row: Record<string, unknown>): TransferRequest => ({
  id: row.id as string,
  source_hospital_id: row.source_hospital_id as string,
  destination_hospital_id: row.destination_hospital_id as string,
  patient_journey_id: row.patient_journey_id as string | null,
  patient_name: row.patient_name as string,
  reason: row.reason as string,
  urgency: row.urgency as TransferRequest['urgency'],
  specialty_needed: row.specialty_needed as string | null,
  status: row.status as TransferRequest['status'],
  requested_by: row.requested_by as string | null,
  responded_by: row.responded_by as string | null,
  requested_at: row.requested_at as string,
  responded_at: row.responded_at as string | null,
  completed_at: row.completed_at as string | null,
  rejection_reason: row.rejection_reason as string | null
});

const mapCommunication = (row: Record<string, unknown>): TransferCommunication => ({
  id: row.id as string,
  transfer_id: row.transfer_id as string,
  sender_id: row.sender_id as string,
  message: row.message as string,
  attachments: Array.isArray(row.attachments) ? row.attachments as string[] : [],
  created_at: row.created_at as string
});

export function useTransferRequests(): UseTransferRequestsReturn {
  const { user } = useAuthContext();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('transfer_requests')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setTransfers((data || []).map(row => mapTransfer(row as Record<string, unknown>)));
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();

    const channel = supabase
      .channel('transfer_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_requests' }, () => {
        fetchTransfers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransfers]);

  const createTransferRequest = useCallback(async (request: CreateTransferRequest): Promise<TransferRequest | null> => {
    if (!user) {
      setError('Must be logged in to create transfer request');
      return null;
    }

    const { data, error: insertError } = await supabase
      .from('transfer_requests')
      .insert([{ 
        source_hospital_id: request.source_hospital_id,
        destination_hospital_id: request.destination_hospital_id,
        patient_name: request.patient_name,
        reason: request.reason,
        urgency: request.urgency || 'normal',
        specialty_needed: request.specialty_needed,
        patient_journey_id: request.patient_journey_id,
        requested_by: user.id 
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating transfer request:', insertError);
      setError(insertError.message);
      return null;
    }
    return mapTransfer(data as Record<string, unknown>);
  }, [user]);

  const acceptTransfer = useCallback(async (transferId: string) => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from('transfer_requests')
      .update({ 
        status: 'accepted', 
        responded_by: user.id, 
        responded_at: new Date().toISOString() 
      })
      .eq('id', transferId);

    if (updateError) {
      console.error('Error accepting transfer:', updateError);
      setError(updateError.message);
    }
  }, [user]);

  const rejectTransfer = useCallback(async (transferId: string, reason: string) => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from('transfer_requests')
      .update({ 
        status: 'rejected', 
        responded_by: user.id, 
        responded_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', transferId);

    if (updateError) {
      console.error('Error rejecting transfer:', updateError);
      setError(updateError.message);
    }
  }, [user]);

  const updateTransferStatus = useCallback(async (transferId: string, status: TransferRequest['status']) => {
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('transfer_requests')
      .update(updateData)
      .eq('id', transferId);

    if (updateError) {
      console.error('Error updating transfer status:', updateError);
      setError(updateError.message);
    }
  }, []);

  const getTransferMessages = useCallback(async (transferId: string): Promise<TransferCommunication[]> => {
    const { data, error: fetchError } = await supabase
      .from('transfer_communications')
      .select('*')
      .eq('transfer_id', transferId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching transfer messages:', fetchError);
      return [];
    }
    return (data || []).map(row => mapCommunication(row as Record<string, unknown>));
  }, []);

  const sendMessage = useCallback(async (transferId: string, message: string): Promise<TransferCommunication | null> => {
    if (!user) {
      setError('Must be logged in to send message');
      return null;
    }

    const { data, error: insertError } = await supabase
      .from('transfer_communications')
      .insert([{ transfer_id: transferId, sender_id: user.id, message }])
      .select()
      .single();

    if (insertError) {
      console.error('Error sending message:', insertError);
      setError(insertError.message);
      return null;
    }
    return mapCommunication(data as Record<string, unknown>);
  }, [user]);

  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const activeTransfers = transfers.filter(t => ['accepted', 'in-transit'].includes(t.status));

  return {
    transfers,
    pendingTransfers,
    activeTransfers,
    loading,
    error,
    createTransferRequest,
    acceptTransfer,
    rejectTransfer,
    updateTransferStatus,
    getTransferMessages,
    sendMessage
  };
}
