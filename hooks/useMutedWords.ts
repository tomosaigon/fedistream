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

            const wordsArray: string[] = Array.isArray(data.mutedWords) ?
                data.mutedWords : [];

            // Sort words: Hashtags should appear first, then the rest of the words alphabetically
            const sortedWords = wordsArray.sort((a, b) => {
                if (a.startsWith('#') && !b.startsWith('#')) {
                    return -1; // a should come before b
                }
                if (!a.startsWith('#') && b.startsWith('#')) {
                    return 1; // b should come before a
                }
                return a.localeCompare(b); // Alphabetical sorting for the rest
            });

            setMutedWords(new Set(sortedWords)); // Convert the array to a Set
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

    const removeMutedWord = async (word: string) => {
        try {
            const response = await fetch('/api/muted-words', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove muted word');
            }

            // Update the local state to remove the word
            setMutedWords((prev) => {
                const updatedSet = new Set(prev);
                updatedSet.delete(word);
                return updatedSet;
            });
        } catch (error) {
            console.error('Error removing muted word:', error);
        }
    };

    useEffect(() => {
        refreshMutedWords(); // Fetch muted words on component mount
    }, []);

    return { mutedWords, loading, refreshMutedWords, addMutedWord, removeMutedWord };
};

export default useMutedWords;
