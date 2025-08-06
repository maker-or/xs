// components/Greeting.tsx
import type React from 'react';

const Greeting: React.FC = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning. ';
    if (hour < 16) return 'Good Afternoon. ';
    return 'Good Evening. ';
  };

  return (
    <div className="m-3 flex items-center justify-center">
      <h1 className="font-serif text-5xl text-[#f7eee3] italic">
        {getGreeting()}
      </h1>
    </div>
  );
};

export default Greeting;
