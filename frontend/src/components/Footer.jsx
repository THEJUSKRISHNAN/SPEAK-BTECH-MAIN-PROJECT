import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full p-4 text-center text-gray-500 bg-gray-100 mt-12">
      © {new Date().getFullYear()} SPEAK Project. All rights reserved.
    </footer>
  );
}