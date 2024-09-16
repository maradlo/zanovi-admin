import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [eanCode, setEanCode] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error("Nepodarilo sa načítať produkty");
      }
    } catch (error) {
      console.error("Chyba pri načítávaní produktov:", error);
      toast.error("Nepodarilo sa načítať produkty");
    }
  };

  const handleScan = () => {
    if (eanCode === "") {
      return toast.error("Zadajte EAN kód");
    }
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.eanCode !== eanCode)
    );
    setEanCode("");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Inventúra</h1>
      <input
        type="text"
        value={eanCode}
        onChange={(e) => setEanCode(e.target.value)}
        placeholder="EAN kód"
        className="mb-4 px-3 py-2 border border-gray-300"
      />
      <button
        onClick={handleScan}
        className="ml-2 py-2 px-4 bg-[#a7db28] text-white rounded-md"
      >
        Skenovať
      </button>
      <table className="table-auto w-full border-collapse border border-gray-200 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-200 px-4 py-2">Názov produktu</th>
            <th className="border border-gray-200 px-4 py-2">EAN kód</th>
            <th className="border border-gray-200 px-4 py-2">Kategória</th>
            <th className="border border-gray-200 px-4 py-2">Podkategória</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td className="border border-gray-200 px-4 py-2">
                {product.name}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {product.eanCode}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {product.category}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {product.subCategory}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
