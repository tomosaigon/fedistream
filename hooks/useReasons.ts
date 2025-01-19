import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const REASONS_QUERY_KEY = ['reasons']; // as const;

  const invalidateReasons = () => {
    queryClient.invalidateQueries({ queryKey: REASONS_QUERY_KEY });
  };

  const { data: reasons = [], isLoading, error } = useQuery<Reason[]>({
    queryKey: REASONS_QUERY_KEY,
    queryFn: fetchReasons
  });

  const addReason = useMutation({
    mutationFn: (data: ReasonData) => addReasonApi(data),
    onSuccess: invalidateReasons,
  });

  const updateReason = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReasonData }) =>
      updateReasonApi(id, data),
    onSuccess: invalidateReasons,
  });

  const removeReason = useMutation({
    mutationFn: (id: number) => removeReasonApi(id),
    onSuccess: invalidateReasons,
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