import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Edit from "./pages/Edit";
import Orders from "./pages/Orders";
import Warehouse from "./pages/Warehouse";
import WarehouseEdit from "./pages/WarehouseEdit";
import ZanoviGaming from "./pages/ZanoviGaming";
import Inventory from "./pages/Inventory";
import Buyback from "./pages/Buyback";
import BuybackEdit from "./pages/BuybackEdit";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "€";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/edit/:id" element={<Edit token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route
                  path="/warehouse"
                  element={<Warehouse token={token} />}
                />
                <Route
                  path="/warehouse/edit/:id"
                  element={<WarehouseEdit token={token} />}
                />
                <Route
                  path="/reservations"
                  element={<ZanoviGaming token={token} />}
                />
                <Route
                  path="/inventory"
                  element={<Inventory token={token} />}
                />
                <Route path="/buyback" element={<Buyback token={token} />} />
                <Route
                  path="/buyback/edit/:id"
                  element={<BuybackEdit token={token} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
