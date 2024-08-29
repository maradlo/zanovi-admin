import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { FaTrash, FaPlus } from "react-icons/fa";

const ZanoviGaming = () => {
  const [consoles, setConsoles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [newConsoleName, setNewConsoleName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchConsoles();
    fetchReservations();
  }, []);

  // Fetch the list of consoles
  const fetchConsoles = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/consoles/list`);
      if (response.data.success) {
        setConsoles(response.data.consoles);
      } else {
        toast.error("Nepodarilo sa načítať konzole");
      }
    } catch (error) {
      console.error("Chyba pri načítavaní konzolí:", error);
      toast.error("Nepodarilo sa načítať konzole");
    }
  };

  // Fetch the list of reservations
  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/reservations/list`);
      if (response.data.success) {
        setReservations(response.data.reservations);
      } else {
        toast.error("Nepodarilo sa načítať rezervácie");
      }
    } catch (error) {
      console.error("Chyba pri načítavaní rezervácií:", error);
      toast.error("Nepodarilo sa načítať rezervácie");
    }
  };

  // Handle adding a new console
  const handleAddConsole = async () => {
    if (!newConsoleName.trim()) {
      toast.error("Názov konzole nemôže byť prázdny");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/consoles`, {
        name: newConsoleName,
      });
      if (response.data.success) {
        toast.success("Konzola bola pridaná");
        setNewConsoleName("");
        setIsModalOpen(false);
        fetchConsoles(); // Refresh the console list
      } else {
        toast.error("Nepodarilo sa pridať konzolu");
      }
    } catch (error) {
      console.error("Chyba pri pridávaní konzole:", error);
      toast.error("Nepodarilo sa pridať konzolu");
    }
  };

  // Handle deleting a console
  const handleDeleteConsole = async (consoleId) => {
    if (window.confirm("Naozaj chcete odstrániť túto konzolu?")) {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/consoles/${consoleId}`
        );
        if (response.data.success) {
          toast.success("Konzola odstránena");
          fetchConsoles(); // Refresh the console list
        } else {
          toast.error("Nepodarilo sa odstrániť konzolu");
        }
      } catch (error) {
        console.error("Chyba pri odstraňovaní konzole:", error);
        toast.error("Nepodarilo sa odstrániť konzolu");
      }
    }
  };

  // Handle deleting a reservation
  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm("Naozaj chcete odstrániť túto rezerváciu?")) {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/reservations/${reservationId}`
        );
        if (response.data.success) {
          toast.success("Rezervácia odstránena");
          fetchReservations(); // Refresh the reservation list
        } else {
          toast.error("Nepodarilo sa odstrániť rezerváciu");
        }
      } catch (error) {
        console.error("Chyba pri odstraňovaní rezervácie:", error);
        toast.error("Nepodarilo sa odstrániť rezerváciu");
      }
    }
  };

  console.log("toto", reservations);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Zanovi Gaming</h1>

      {/* Console Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Spravujte konzoly</h2>
        <button
          className="py-2 px-4 bg-blue-500 text-white rounded-md mb-4"
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus className="inline mr-2" /> Pridať konzolu
        </button>
        <table className="table-auto w-full border-collapse border border-gray-200 mb-8">
          <thead>
            <tr>
              <th className="border border-gray-200 px-4 py-2">
                Názov konzoly
              </th>
              <th className="border border-gray-200 px-4 py-2">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {consoles.map((console) => (
              <tr key={console._id}>
                <td className="border border-gray-200 px-4 py-2">
                  {console.name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteConsole(console._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reservations Section */}
      <div>
        <h2 className="text-2xl mb-4">Rezervácie</h2>
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-200 px-4 py-2">Dátum</th>
              <th className="border border-gray-200 px-4 py-2">Trvanie</th>
              <th className="border border-gray-200 px-4 py-2">Hráči</th>
              <th className="border border-gray-200 px-4 py-2">Konzola</th>
              <th className="border border-gray-200 px-4 py-2">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td className="border border-gray-200 px-4 py-2">
                  {reservation.dateTime}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {reservation.duration} h
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {reservation.persons}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {reservation.console}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteReservation(reservation._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Consoles */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md">
            <h2 className="text-xl mb-4">Pridať novú konzolu</h2>
            <input
              type="text"
              value={newConsoleName}
              onChange={(e) => setNewConsoleName(e.target.value)}
              className="border border-gray-300 px-3 py-2 w-full mb-4"
              placeholder="Názov konzoly"
            />
            <div className="flex justify-end gap-2">
              <button
                className="py-2 px-4 bg-gray-300 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Zrušiť
              </button>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-md"
                onClick={handleAddConsole}
              >
                Pridať konzolu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZanoviGaming;
