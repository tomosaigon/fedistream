import { useState } from 'react';
import Link from 'next/link';
import { useMutedWords } from '../hooks/useMutedWords';

const QuickMutedWords = () => {
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
    <div className="">
      <div className="flex mb-4">
        <Link
          href="/muted-words"
          className="w-full text-sm text-blue-500 hover:text-blue-600 rounded transition-all duration-200 block"
        >
          Manage Muted Words
        </Link>
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
        <div className="flex flex-wrap space-x-2">
          {mutedWords.map((word) => (
            <div key={word} className="flex items-center bg-gray-200 ml-2 mb-1 px-3 py-2 rounded-md">
              <span className="mr-2">{word}</span>
              <button
                onClick={() => handleRemove(word)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickMutedWords;