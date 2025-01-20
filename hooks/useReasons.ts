import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Reason, ReasonData } from '@/db/database';

const fetchReasons = async (): Promise<Reason[]> => {
  const response = await fetch('/api/reasons');
  if (!response.ok) {
    throw new Error('Failed to fetch reasons');
  }
  const data = await response.json();
  return data.data;
};

const addReasonApi = async (data: ReasonData) => {
  const response = await fetch('/api/reasons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to add reason');
  }
};

const updateReasonApi = async (id: number, data: ReasonData) => {
  const response = await fetch('/api/reasons', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    throw new Error('Failed to update reason');
  }
};

const removeReasonApi = async (id: number) => {
  const response = await fetch('/api/reasons', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete reason');
  }
};

export const useReasons = () => {
  const queryClient = useQueryClient();
  const REASONS_QUERY_KEY = ['reasons'];

  const invalidateReasons = () => {
    queryClient.invalidateQueries({ queryKey: REASONS_QUERY_KEY });
  };

  const { data: reasons = [], isLoading, error } = useQuery<Reason[]>({
    queryKey: REASONS_QUERY_KEY,
    queryFn: fetchReasons,
  });

  if (error) {
    toast.error(`Error fetching reasons: ${(error as Error).message}`);
  }

  const addReason = useMutation({
    mutationFn: (data: ReasonData) => addReasonApi(data),
    onSuccess: () => {
      toast.success('Reason added successfully!');
      invalidateReasons();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add reason: ${error.message}`);
    },
  });

  const updateReason = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReasonData }) => updateReasonApi(id, data),
    onSuccess: () => {
      toast.success('Reason updated successfully!');
      invalidateReasons();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update reason: ${error.message}`);
    },
  });

  const removeReason = useMutation({
    mutationFn: (id: number) => removeReasonApi(id),
    onSuccess: () => {
      toast.success('Reason removed successfully!');
      invalidateReasons();
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove reason: ${error.message}`);
    },
  });

  return {
    reasons,
    isLoading,
    error,
    addReason: addReason.mutateAsync,
    updateReason: updateReason.mutateAsync,
    removeReason: removeReason.mutateAsync,
  };
};