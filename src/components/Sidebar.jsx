import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaPlusCircle,
  FaStore,
  FaBoxOpen,
  FaWarehouse,
  FaMoneyBill,
  FaCheck,
  FaClock,
} from "react-icons/fa";

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
          <FaPlusCircle />
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
          <FaStore />
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
          <FaBoxOpen />
          <p className="hidden md:block">Objednávky</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/warehouse"
        >
          <FaWarehouse />
          <p className="hidden md:block">Sklad</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/buyback"
        >
          <FaMoneyBill />
          <p className="hidden md:block">Výkup</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/inventory"
        >
          <FaCheck />
          <p className="hidden md:block">Inventúra</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-[#a7db28] border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#a7db28] text-white" : "text-black"
            }`
          }
          to="/reservations"
        >
          <FaClock />
          <p className="hidden md:block">Zanovi Gaming</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
