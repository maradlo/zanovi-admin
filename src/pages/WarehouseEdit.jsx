import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const WarehouseEdit = ({ token }) => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantityInStock, setQuantityInStock] = useState({ new: 0, used: 0 });
  const [quantityInStore, setQuantityInStore] = useState({ new: 0, used: 0 });
  const [price, setPrice] = useState({ new: 0, used: 0 });
  const [percentage, setPercentage] = useState(60); // Default percentage for used price
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/${id}`);
      if (response.data.success) {
        const product = response.data.product;

        // Set default values if undefined
        setQuantityInStock(
          product.warehouse?.quantityInStock || { new: 0, used: 0 }
        );
        setQuantityInStore(
          product.warehouse?.quantityInStore || { new: 0, used: 0 }
        );
        setPrice(product.warehouse?.price || { new: 0, used: 0 });
        setDocuments(product.warehouse?.documents || []);
        setProduct(product);
      } else {
        toast.error("Nepodarilo sa načítať produkt");
      }
    } catch (error) {
      console.error("Chyba pri načítaní produktu:", error);
      toast.error("Nepodarilo sa načítať produkt");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments([...documents, ...files]);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const data = {
      inStock: quantityInStock.new > 0 || quantityInStock.used > 0,
      inStore: quantityInStore.new > 0 || quantityInStore.used > 0,
      quantityInStock,
      quantityInStore,
      price,
      documents,
    };

    try {
      const response = await axios.put(
        `${backendUrl}/api/product/warehouse/update/${id}`,
        data,
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Skladové hodnoty boli úspešne aktualizované");
        navigate("/warehouse");
      } else {
        toast.error("Nepodarilo sa upraviť skladové hodnoty");
      }
    } catch (error) {
      console.error("Chyba pri upravovaní skladových hodnôt:", error);
      toast.error("Nepodarilo sa upraviť skladové hodnoty");
    }
  };

  const handleNewPriceChange = (e) => {
    const newPrice = parseFloat(e.target.value);
    const usedPrice = (newPrice * percentage) / 100;

    setPrice({
      ...price,
      new: newPrice,
      used: usedPrice,
    });
  };

  const handlePercentageChange = (e) => {
    const newPercentage = parseFloat(e.target.value);
    const usedPrice = (price.new * newPercentage) / 100;

    setPercentage(newPercentage);
    setPrice({
      ...price,
      used: usedPrice,
    });
  };

  if (!product) return <div>Načítávam...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">
        Editovať skladový produkt: {product.name}
      </h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Quantity Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Počet nových kusov na sklade:</label>
            <input
              type="number"
              value={quantityInStock.new}
              onChange={(e) =>
                setQuantityInStock({
                  ...quantityInStock,
                  new: parseInt(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block mb-2">
              Počet použitých kusov na sklade:
            </label>
            <input
              type="number"
              value={quantityInStock.used}
              onChange={(e) =>
                setQuantityInStock({
                  ...quantityInStock,
                  used: parseInt(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block mb-2">
              Počet nových kusov na predajni:
            </label>
            <input
              type="number"
              value={quantityInStore.new}
              onChange={(e) =>
                setQuantityInStore({
                  ...quantityInStore,
                  new: parseInt(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block mb-2">
              Počet použitých kusov na predajni:
            </label>
            <input
              type="number"
              value={quantityInStore.used}
              onChange={(e) =>
                setQuantityInStore({
                  ...quantityInStore,
                  used: parseInt(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300"
            />
          </div>
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block mb-2">Cena pre nové produkty:</label>
            <input
              type="number"
              value={price.new}
              onChange={handleNewPriceChange}
              className="px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block mb-2">Cena pre použité produkty:</label>
            <input
              type="number"
              value={price.used}
              onChange={(e) =>
                setPrice({
                  ...price,
                  used: parseFloat(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300"
            />
          </div>
        </div>

        {/* Percentage Input */}
        <div className="mt-4">
          <label className="block mb-2">
            Percento pre použité produkty (%):
          </label>
          <input
            type="number"
            value={percentage}
            onChange={handlePercentageChange}
            className="px-3 py-2 border border-gray-300"
          />
        </div>

        <div className="mt-4">
          <label className="block mb-2">Dokumenty:</label>
          <input
            type="file"
            onChange={handleFileUpload}
            multiple
            className="px-3 py-2 border border-gray-300"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Uložiť
        </button>
      </form>
    </div>
  );
};

export default WarehouseEdit;
