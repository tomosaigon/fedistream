import { useState } from 'react';
import { useMutedWords } from '../hooks/useMutedWords';

const ManageMutedWords = () => {
  const { mutedWords, isLoading, createMutedWord, deleteMutedWord } = useMutedWords();
  const [newWord, setNewWord] = useState('');

  const handleAdd = async () => {
    if (newWord.trim()) {
      await createMutedWord(newWord.trim());
      setNewWord(''); // Reset input after adding
    }
  };

  const handleRemove = async (word: string) => {
    await deleteMutedWord(word);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-xl font-bold mb-4">Manage Muted Words</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Enter a word to mute"
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {isLoading ? (
        <p>Loading muted words...</p>
      ) : (
        <ul className="space-y-2">
          {mutedWords.map((word) => (
            <li key={word} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
              <span>{word}</span>
              <button
                onClick={() => handleRemove(word)}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageMutedWords;