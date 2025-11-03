import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 p-4 shadow-md sticky top-0 z-10">
      <h1 className="text-center text-2xl sm:text-3xl font-bold text-white tracking-wider">
        UIU CGPA Calculator
      </h1>
    </header>
  );
};