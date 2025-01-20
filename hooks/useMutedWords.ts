import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const fetchMutedWords = async (): Promise<string[]> => {
  const response = await fetch('/api/muted-words');
  if (!response.ok) {
    throw new Error('Failed to fetch muted words');
  }
  const data = await response.json();
  return data.data;
};

const createMutedWordApi = async (word: string) => {
  const response = await fetch('/api/muted-words', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word }),
  });
  if (!response.ok) {
    throw new Error('Failed to add muted word');
  }
};

const deleteMutedWordApi = async (word: string) => {
  const response = await fetch('/api/muted-words', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete muted word');
  }
};

export const useMutedWords = () => {
  const queryClient = useQueryClient();
  const MUTED_WORDS_QUERY_KEY = ['mutedWords'];

  const invalidateMutedWords = () => {
    queryClient.invalidateQueries({ queryKey: MUTED_WORDS_QUERY_KEY });
  };

  const { data: mutedWords = [], isLoading, error } = useQuery<string[]>({
    queryKey: MUTED_WORDS_QUERY_KEY,
    queryFn: fetchMutedWords,
    select: (words) =>
      words.sort((a, b) => {
        if (a.startsWith('#') && !b.startsWith('#')) {
          return -1; // a should come before b
        }
        if (!a.startsWith('#') && b.startsWith('#')) {
          return 1; // b should come before a
        }
        return a.localeCompare(b); // Alphabetical sorting for the rest
      }),
  });

  // Show toast for query errors
  if (error) {
    toast.error(`Error fetching muted words: ${error.message}`);
  }

  const createMutedWord = useMutation({
    mutationFn: (word: string) => createMutedWordApi(word),
    onSuccess: () => {
      toast.success('Muted word added successfully!');
      invalidateMutedWords();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add muted word: ${error.message}`);
    },
  });

  const deleteMutedWord = useMutation({
    mutationFn: (word: string) => deleteMutedWordApi(word),
    onSuccess: () => {
      toast.success('Muted word removed successfully!');
      invalidateMutedWords();
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove muted word: ${error.message}`);
    },
  });

  return {
    mutedWords,
    isLoading,
    error,
    createMutedWord: createMutedWord.mutateAsync,
    deleteMutedWord: deleteMutedWord.mutateAsync,
  };
};