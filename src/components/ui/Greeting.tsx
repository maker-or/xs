// components/Greeting.tsx
import React from 'react';

const Greeting: React.FC = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning. ';
    if (hour < 16) return 'Good Afternoon. ';
    return 'Good Evening. ';
  };

  return (
    <div className="flex justify-center items-center m-3">
      <h1 className="text-5xl  text-[#F7EEE3]  font-serif italic">{getGreeting()}</h1>
    </div>
  );
};

export default Greeting;
