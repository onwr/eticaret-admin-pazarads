
import { useState, useEffect, useCallback } from 'react';
import { Order, CallOutcome } from '../types';
import { getCallQueue, saveCallResult } from '../lib/api';
import { useAuth } from './useAuth';

export const useCallQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallOrder, setActiveCallOrder] = useState<Order | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCallQueue();
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch call queue", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const startCall = (order: Order) => {
    setActiveCallOrder(order);
  };

  const endCall = async (result: CallOutcome, note: string, duration: number) => {
    if (!activeCallOrder || !user) return;
    
    try {
      await saveCallResult(activeCallOrder.id, result, note, duration, { id: user.id, name: user.name || 'Agent' });
      setActiveCallOrder(null);
      fetchQueue(); // Refresh list to remove processed order
    } catch (error) {
      console.error("Failed to save call result", error);
    }
  };

  const cancelCall = () => {
    setActiveCallOrder(null);
  };

  return {
    queue,
    loading,
    activeCallOrder,
    refreshQueue: fetchQueue,
    startCall,
    endCall,
    cancelCall
  };
};
