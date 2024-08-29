import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const BuybackEdit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [buyback, setBuyback] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    residence: "",
    dateOfBirth: "",
    phoneNumber: "",
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchBuyback();
  }, [id]);

  const fetchBuyback = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/buyback/${id}`, {
        headers: { token },
      });
      if (response.data.success) {
        const buybackData = response.data.buyback;
        setBuyback(buybackData);
        setCustomerDetails(buybackData.customerDetails);
        setProducts(buybackData.products);
      } else {
        toast.error("Nepodarilo sa načítať dáta výkupu");
      }
    } catch (error) {
      console.error("Chyba pri načítávaní výkupu:", error);
      toast.error("Nepodarilo sa načítať dáta výkupu");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });
  };

  const handlePriceChange = (index, newPrice) => {
    const updatedProducts = [...products];
    updatedProducts[index].buybackPrice = parseFloat(newPrice);
    setProducts(updatedProducts);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const data = {
      customerDetails,
      products,
    };

    try {
      const response = await axios.put(
        `${backendUrl}/api/buyback/${id}`,
        data,
        {
          headers: { token, "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        toast.success("Výkup bol aktualizovaný");
        navigate("/buyback");
      } else {
        toast.error("Nepodarilo sa aktualizovať výkup");
      }
    } catch (error) {
      console.error("Chyba pri aktualizovaní výkupu: ", error);
      toast.error("Nepodarilo sa aktualizovať výkup");
    }
  };

  const handleDownloadPDF = () => {
    window.open(`${backendUrl}/api/buyback/download/${id}`, "_blank");
  };

  if (!buyback) return <div>Načítávam...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Editácia výkupu</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Detail kupujúceho</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Meno:</label>
              <input
                type="text"
                name="firstName"
                value={customerDetails.firstName}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 w-full"
                required
              />
            </div>
            <div>
              <label>Priezvisko:</label>
              <input
                type="text"
                name="lastName"
                value={customerDetails.lastName}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 w-full"
                required
              />
            </div>
            <div>
              <label>Národnosť:</label>
              <input
                type="text"
                name="nationality"
                value={customerDetails.nationality}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 w-full"
                required
              />
            </div>
            <div>
              <label>Adresa:</label>
              <input
                type="text"
                name="residence"
                value={customerDetails.residence}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 w-full"
                required
              />
            </div>
            <div>
              <label>Dátum narodenia:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={customerDetails.dateOfBirth}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 w-full"
                required
              />
            </div>
            <div>
              <label>Telefónne číslo:</label>
              <input
                type="text"
                name="phoneNumber"
                value={customerDetails.phoneNumber}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 w-full"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Vybrané produkty</h2>
          <ul>
            {products.map((product, index) => (
              <li key={index} className="mb-4">
                <div className="flex items-center gap-4">
                  <span>
                    {product.name} ({product.category})
                  </span>
                  <input
                    type="number"
                    value={product.buybackPrice}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="px-2 py-1 border border-gray-300"
                  />
                  <span>€</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Uložiť zmeny
        </button>
      </form>

      <button
        onClick={handleDownloadPDF}
        className="py-2 px-4 bg-green-500 text-white rounded-md mt-4"
      >
        Stiahnuť PDF
      </button>
    </div>
  );
};

export default BuybackEdit;
