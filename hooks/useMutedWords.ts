import { useState, useEffect } from 'react';

const useMutedWords = () => {
    const [mutedWords, setMutedWords] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const refreshMutedWords = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/muted-words');
            if (!response.ok) {
                throw new Error('Failed to fetch muted words');
            }

            const data = await response.json();
            const wordsArray = data.mutedWords || [];
            setMutedWords(new Set(wordsArray)); // Convert the array to a Set
        } catch (error) {
            console.error('Error fetching muted words:', error);
        } finally {
            setLoading(false);
        }
    };

    const addMutedWord = async (word: string) => {
        try {
            const response = await fetch('/api/muted-words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word }),
            });

            if (!response.ok) {
                throw new Error('Failed to add muted word');
            }

            // Update the local state to include the new word
            setMutedWords((prev) => new Set(prev).add(word));
        } catch (error) {
            console.error('Error adding muted word:', error);
        }
    };

    useEffect(() => {
        refreshMutedWords(); // Fetch muted words on component mount
    }, []);

    return { mutedWords, loading, refreshMutedWords, addMutedWord };
};

export default useMutedWords;