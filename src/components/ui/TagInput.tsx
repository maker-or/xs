/* eslint-disable react/prop-types */
// components/TagInput.tsx
import { type ChangeEvent, type KeyboardEvent, useState } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault(); // Prevent space from being added to input
      if (inputValue.trim()) {
        setTags((prevTags) => [...prevTags, inputValue.trim()]);
        setInputValue(''); // Clear input after adding tag
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleDelete = (tagToDelete: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
  };

  return (
    <div>
      <input
        className="mt-8 w-[90%] border-gray-300 border-b bg-inherit text-2xl text-[#E8E8E6] outline-none placeholder:text-[#9CA3AF]"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press space..."
        type="text"
        value={inputValue}
      />

      <div className="mt-6 mb-2 flex justify-start gap-4">
        {tags.map((tag, index) => (
          <div
            className="rounded-md bg-blue-600 px-6 py-2 text-white"
            key={index}
          >
            {tag}
            <button
              className="ml-[5px] cursor-pointer text-white"
              onClick={() => handleDelete(tag)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
