import React from "react";
import { Link } from "react-router-dom";

const Nav: React.FC = () => {
  return (
    <div className="w-screen h-12 bg-orange-500 border-b flex items-center m-0 p-0 top-0 left-0 z-0 fixed">
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
