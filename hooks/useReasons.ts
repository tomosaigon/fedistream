import { useState, useEffect } from 'react';

type Reason = {
  id: number;
  reason: string;
  active: number;
  filter: number;
  created_at: string;
};

const useReasons = () => {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshReasons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reasons');
      if (!response.ok) {
        throw new Error('Failed to fetch reasons');
      }
      const data = await response.json();
      setReasons(data.reasons || []);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReason = async (reason: string, active = true, filter = false) => {
    try {
      const response = await fetch('/api/reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, active, filter }),
      });
      if (!response.ok) {
        throw new Error('Failed to add reason');
      }
      await refreshReasons();
    } catch (error) {
      console.error('Error adding reason:', error);
    }
  };

  const updateReason = async (
    reason: string, 
    { newReason, active, filter }: { newReason: string; active: number; filter: number }
  ) => {
    try {
      const response = await fetch('/api/reasons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, newReason, active, filter }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update reason');
      }
  
      await refreshReasons();
    } catch (error) {
      console.error('Error updating reason:', error);
    }
  };

  const removeReason = async (reason: string) => {
    try {
      const response = await fetch('/api/reasons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete reason');
      }
      await refreshReasons();
    } catch (error) {
      console.error('Error deleting reason:', error);
    }
  };

  useEffect(() => {
    refreshReasons();
  }, []);

  return { reasons, loading, refreshReasons, addReason, updateReason, removeReason };
};

export default useReasons;
