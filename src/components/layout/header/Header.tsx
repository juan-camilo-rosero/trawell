"use client";

import { RiMenu3Fill } from "react-icons/ri";
import { useContext } from "react";

function Header() {
  return (
    <header className="bg-secondary-200 p-4 w-screen fixed flex flex-row items-center justify-between lg:py-3 z-30">
      <div className="md:max-w-xl w-full flex flex-row items-center justify-between">
        <div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png" alt="Logo pinterest" className="w-8 h-8"/>
        </div>
        <button className="md:hidden">
          <RiMenu3Fill className=" text-3xl" />
        </button>
      </div>
    </header>
  );
}

export default Header;
