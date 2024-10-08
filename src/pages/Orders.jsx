import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message);
    }
  };

  const deleteOrderHandler = async (orderId) => {
    const confirmed = window.confirm(
      "Naozaj chcete odstrániť túto objednávku? Táto akcia je nevratná."
    );

    if (!confirmed) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/delete`,
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Objednávka bola úspešne odstránená.");
        fetchAllOrders(); // Refresh the orders list after deletion
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Chyba pri odstraňovaní objednávky.");
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  console.log(orders);

  return (
    <div>
      <h3>Prehľad objednávok</h3>
      <div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              <div>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return (
                      <p className="py-0.5" key={index}>
                        {" "}
                        {item.name} x {item.quantity} <span> {item.size} </span>{" "}
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5" key={index}>
                        {" "}
                        {item.name} x {item.quantity} <span> {item.size} </span>{" "}
                        ,
                      </p>
                    );
                  }
                })}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Produkty : {order.items.length}
              </p>
              <p className="mt-3">
                Platobná metóda :{" "}
                {order.paymentMethod === "COD"
                  ? "Dobierka"
                  : order.paymentMethod}
              </p>
              <p>Stav platby : {order.payment ? "Zaplatená" : "Nezaplatená"}</p>
              <p>Dátum : {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-[15px]">
              {currency}
              {order.amount.toFixed(2)}
            </p>
            <div className="flex gap-2">
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold"
              >
                <option value="Order Placed">Zadaná objednávka</option>
                <option value="Packing">Balenie</option>
                <option value="Shipped">Odoslané</option>
                <option value="Out for delivery">Na doručenie</option>
                <option value="Delivered">Doručené</option>
              </select>
              <button
                onClick={() => deleteOrderHandler(order._id)}
                className="bg-red-500 text-white p-2 rounded-md"
              >
                Odstrániť
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
