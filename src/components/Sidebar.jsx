import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/add"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="" />
          <p className="hidden md:block">Pridať produkt</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">Produkty</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/orders"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">Objednávky</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
