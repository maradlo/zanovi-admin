import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Warehouse = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        const categorizedData = categorizeProducts(response.data.products);
        setWarehouseData(categorizedData);
      } else {
        toast.error("Nepodarilo sa načítať dáta skladu");
      }
    } catch (error) {
      console.error("Chyba pri načítaní dát skladu:", error);
      toast.error("Nepodarilo sa načítať dáta skladu");
    }
  };

  const categorizeProducts = (products) => {
    const categories = {};

    products.forEach((product) => {
      const { category, subCategory } = product;

      if (!categories[category]) {
        categories[category] = {};
      }
      if (!categories[category][subCategory]) {
        categories[category][subCategory] = [];
      }

      categories[category][subCategory].push(product);
    });

    return categories;
  };

  const toggleCategory = (category, subCategory) => {
    const key = `${category}-${subCategory}`;
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  const isProductOutOfStock = (product) => {
    return (
      product.warehouse.quantityInStock.new === 0 &&
      product.warehouse.quantityInStock.used === 0 &&
      product.warehouse.quantityInStore.new === 0 &&
      product.warehouse.quantityInStore.used === 0
    );
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Sklad</h1>
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="border border-gray-200 px-4 py-2">Kategória</th>
            <th className="border border-gray-200 px-4 py-2">Podkategória</th>
            <th className="border border-gray-200 px-4 py-2">
              Počet produktov
            </th>
            <th className="border border-gray-200 px-4 py-2">Akcie</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(warehouseData).map((category) =>
            Object.keys(warehouseData[category]).map((subCategory) => (
              <React.Fragment key={`${category}-${subCategory}`}>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">
                    {category}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {subCategory}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {warehouseData[category][subCategory].length}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 flex justify-center">
                    <button
                      onClick={() => toggleCategory(category, subCategory)}
                      className="text-blue-500"
                    >
                      {expandedCategory === `${category}-${subCategory}` ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedCategory === `${category}-${subCategory}` &&
                  warehouseData[category][subCategory].map((product) => (
                    <tr
                      key={product._id}
                      className={
                        isProductOutOfStock(product) ? "bg-gray-300" : ""
                      }
                    >
                      <td
                        className="border border-gray-200 px-4 py-2"
                        colSpan="4"
                      >
                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <span className="font-bold">{product.name}</span>
                            <div>
                              <span>
                                {product.condition === "new"
                                  ? "Nový"
                                  : "Použitý"}
                              </span>
                              <span className="ml-4">
                                Na sklade (Nový):{" "}
                                {product.warehouse.quantityInStock.new} ks, Na
                                predajni (Nový):{" "}
                                {product.warehouse.quantityInStore.new} ks
                              </span>
                              <span className="ml-4">
                                Na sklade (Použitý):{" "}
                                {product.warehouse.quantityInStock.used} ks, Na
                                predajni (Použitý):{" "}
                                {product.warehouse.quantityInStore.used} ks
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/warehouse/edit/${product._id}`)
                            }
                            className="text-green-500"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Warehouse;
