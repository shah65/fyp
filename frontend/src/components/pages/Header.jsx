import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({user}) => {
   
  return (
    <header className="flex items-center w-full px-6">
      {/* Logo */}
      <div className="text-white hover:text-red-500  font-bold text-xl">AWKUM</div>

      {/* Nav */}
      <nav className="flex space-x-4 ml-auto">
        <Link
          to="/"
          className="text-white px-4 py-2 rounded-md hover:text-zinc-900 hover:bg-white/30 transition"
        >
          Home
        </Link>
        <Link
          to="/group"
          className="text-white px-4 py-2 rounded-md hover:text-zinc-900 hover:bg-white/30 transition"
        >
          Group
        </Link>

        <Link
          to="/profile"
          className="text-white px-4 py-2 rounded-md hover:text-zinc-900 hover:bg-white/30 transition"
        >
          Profile
        </Link>

        <Link
          to="/logout"
          className="text-white px-4 py-2 rounded-md hover:text-zinc-900 hover:bg-white/30 transition"
        >
          Logout
        </Link>
      </nav>
    </header>
  );
};

export default Header;
