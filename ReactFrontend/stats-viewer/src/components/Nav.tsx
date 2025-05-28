import React from "react";
import { Link } from "react-router-dom";

const Nav: React.FC = () => {
  return (
    <div className="w-full h-12 bg-orange-500 border-b flex items-center">
      <Link
        to="/"
        className="text-white text-lg font-bold px-4 py-2 hover:bg-orange-600"
      >
        UVA Baseball Stats
      </Link>
    </div>
  );
};

export default Nav;
