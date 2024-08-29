import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Buyback = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [buybacks, setBuybacks] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    residence: "",
    dateOfBirth: "",
    phoneNumber: "",
  });
  const [productSearch, setProductSearch] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [percentage, setPercentage] = useState(60); // Default to 60%

  useEffect(() => {
    fetchBuybacks();
  }, []);

  const fetchBuybacks = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/buyback/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setBuybacks(response.data.buybacks);
      } else {
        toast.error("Nepodarilo sa načítať výkupy");
      }
    } catch (error) {
      console.error("Chyba pri načítávaní výkupov:", error);
      toast.error("Nepodarilo sa načítať výkupy");
    }
  };

  const handleProductSearch = async (e) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);

    if (searchValue.length > 2) {
      try {
        const response = await axios.get(
          `${backendUrl}/api/product/search?query=${searchValue}`
        );
        if (response.data.success) {
          setSuggestedProducts(response.data.products);
        } else {
          setSuggestedProducts([]);
        }
      } catch (error) {
        console.error("Chyba pri načítávaní návrhov:", error);
        toast.error("Nepodarilo sa načítať návrhy");
      }
    } else {
      setSuggestedProducts([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestedProducts.length > 0) {
        handleAddProduct(suggestedProducts[0]);
      } else if (productSearch.trim()) {
        handleAddCustomProduct(productSearch.trim());
      }
    }
  };

  const handleAddProduct = (product) => {
    const warehousePriceNew = product.warehouse?.price?.new || 0;
    const buybackPrice = (warehousePriceNew * (percentage / 100)).toFixed(2);

    setProducts([
      ...products,
      {
        ...product,
        buybackPrice: parseFloat(buybackPrice),
      },
    ]);
    setProductSearch("");
    setSuggestedProducts([]);
  };

  const handleAddCustomProduct = (productName) => {
    setProducts([
      ...products,
      {
        name: productName,
        buybackPrice: 0,
        category: "Custom",
      },
    ]);
    setProductSearch("");
    setSuggestedProducts([]);
  };

  const handlePriceChange = (index, newPrice) => {
    const updatedProducts = [...products];
    updatedProducts[index].buybackPrice = parseFloat(newPrice);
    setProducts(updatedProducts);
  };

  const handlePercentageChange = (e) => {
    const newPercentage = parseFloat(e.target.value);
    setPercentage(newPercentage);

    // Recalculate all buyback prices based on the new percentage
    const updatedProducts = products.map((product) => {
      const warehousePriceNew = product.warehouse?.price?.new || 0;
      return {
        ...product,
        buybackPrice: (warehousePriceNew * (newPercentage / 100)).toFixed(2),
      };
    });

    setProducts(updatedProducts);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      customerDetails,
      products,
    };

    try {
      const response = await axios.post(`${backendUrl}/api/buyback/add`, data, {
        headers: { token, "Content-Type": "application/json" },
      });

      if (response.data.success) {
        toast.success("Výkup sa vytvoril");
        setProducts([]);
        setCustomerDetails({
          firstName: "",
          lastName: "",
          nationality: "",
          residence: "",
          dateOfBirth: "",
          phoneNumber: "",
        });
        fetchBuybacks(); // Refresh the list after adding a buyback
      } else {
        toast.error("Nepodarilo sa vytvoriť výkup");
      }
    } catch (error) {
      console.error("Chyba pri vytváraní výkupu:", error);
      toast.error("Nepodarilo sa vytvoriť výkup");
    }
  };

  const handleDownloadPDF = (id) => {
    window.open(`${backendUrl}/api/buyback/download/${id}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ste si istý že chcete vymazať tento výkup?")) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/buyback/${id}`, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success("Výkup bol vymazaný");
        fetchBuybacks(); // Refresh the list
      } else {
        toast.error("Nepodarilo sa vymazať výkup");
      }
    } catch (error) {
      console.error("Chyba pri vymazávaní výkupu:", error);
      toast.error("Nepodarilo sa vymazať výkup");
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Výkup</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label>Vyhľadávanie produktu:</label>
          <input
            type="text"
            value={productSearch}
            onChange={handleProductSearch}
            onKeyDown={handleKeyDown}
            className="px-3 ml-4 py-2 border border-gray-300"
            placeholder="Názov produktu..."
          />
          {suggestedProducts.length > 0 && (
            <ul className="mt-2 border border-gray-300">
              {suggestedProducts.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleAddProduct(product)}
                  className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                >
                  {product.name} ({product.category})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label>Percento z ceny:</label>
          <input
            type="number"
            value={percentage}
            onChange={handlePercentageChange}
            className="px-3 ml-4 py-2 border border-gray-300"
            placeholder="Napr. 60"
          />
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

        <div>
          <h2 className="text-2xl font-bold mb-4">Detail kupujúceho</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Details Fields */}
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

        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Uložiť výkup
        </button>
      </form>

      <hr className="my-8" />

      <h2 className="text-2xl font-bold mb-4">Zoznam výkupov</h2>
      <ul>
        {buybacks.map((buyback) => (
          <li key={buyback._id} className="mb-4">
            <div className="flex justify-between items-center">
              <span>
                {buyback.customerDetails.firstName}{" "}
                {buyback.customerDetails.lastName}
              </span>
              <div className="flex gap-4">
                <Link
                  to={`/buyback/edit/${buyback._id}`}
                  className="text-blue-500"
                >
                  Editovať
                </Link>
                <button
                  onClick={() => handleDownloadPDF(buyback._id)}
                  className="text-green-500"
                >
                  Stiahnuť PDF
                </button>
                <button
                  onClick={() => handleDelete(buyback._id)}
                  className="text-red-500"
                >
                  Vymazať
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Buyback;
