import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { FaSave, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Warehouse = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [categories, setCategories] = useState([]); // To store unique categories
  const [filteredData, setFilteredData] = useState([]); // For filtering products
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category filter
  const [selectedSubCategory, setSelectedSubCategory] = useState(""); // Selected subcategory filter
  const [inputValues, setInputValues] = useState({}); // Store EAN and Serial Number inputs for each product entry
  const navigate = useNavigate(); // To navigate to the edit page

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        const categorizedData = categorizeProducts(response.data.products);
        setWarehouseData(categorizedData);
        setFilteredData(categorizedData); // Initialize filtered data with all products
        setCategories(getUniqueCategories(response.data.products)); // Store unique categories
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
      if (!product || !product.warehouse) return; // Safeguard against null products

      const { category, subCategory } = product;
      if (!categories[category]) {
        categories[category] = {};
      }
      if (!categories[category][subCategory]) {
        categories[category][subCategory] = [];
      }

      const totalNewInStock = product.warehouse.quantityInStock?.new || 0;
      const totalNewInStore = product.warehouse.quantityInStore?.new || 0;
      const totalUsedInStock = product.warehouse.quantityInStock?.used || 0;
      const totalUsedInStore = product.warehouse.quantityInStore?.used || 0;

      // Add "new" products in stock
      for (let i = 0; i < totalNewInStock; i++) {
        categories[category][subCategory].push({
          ...product,
          warehouseProductId: product._id, // Add warehouseProductId here
          condition: "new",
          location: "in stock",
          uniqueId: `${product._id}-${i}-new-in-stock`,
        });
      }

      // Add "new" products in store
      for (let i = 0; i < totalNewInStore; i++) {
        categories[category][subCategory].push({
          ...product,
          condition: "new",
          location: "in store",
          uniqueId: `${product._id}-${i}-new-in-store`,
        });
      }

      // Add "used" products in stock
      for (let i = 0; i < totalUsedInStock; i++) {
        categories[category][subCategory].push({
          ...product,
          condition: "used",
          location: "in stock",
          uniqueId: `${product._id}-${i}-used-in-stock`,
        });
      }

      // Add "used" products in store
      for (let i = 0; i < totalUsedInStore; i++) {
        categories[category][subCategory].push({
          ...product,
          condition: "used",
          location: "in store",
          uniqueId: `${product._id}-${i}-used-in-store`,
        });
      }
    });

    return categories;
  };

  const getUniqueCategories = (products) => {
    const uniqueCategories = {};
    products.forEach((product) => {
      if (!product) return; // Safeguard against null products
      if (!uniqueCategories[product.category]) {
        uniqueCategories[product.category] = new Set();
      }
      uniqueCategories[product.category].add(product.subCategory || "General");
    });
    return uniqueCategories;
  };

  const isProductOutOfStock = (product) => {
    return (
      product.warehouse.quantityInStock?.new === 0 &&
      product.warehouse.quantityInStock?.used === 0 &&
      product.warehouse.quantityInStore?.new === 0 &&
      product.warehouse.quantityInStore?.used === 0
    );
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);
    setSelectedSubCategory(""); // Reset subcategory when category changes
    filterData(selected, "");
  };

  const handleSubCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedSubCategory(selected);
    filterData(selectedCategory, selected);
  };

  const filterData = (category, subCategory) => {
    if (!category) {
      setFilteredData(warehouseData);
      return;
    }
    let filtered = { [category]: {} };
    if (subCategory) {
      filtered[category][subCategory] =
        warehouseData[category][subCategory] || [];
    } else {
      filtered[category] = warehouseData[category];
    }
    setFilteredData(filtered);
  };

  const handleInputChange = (uniqueId, field, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [uniqueId]: {
        ...prevValues[uniqueId],
        [field]: value,
      },
    }));
  };

  const saveProductDetails = async (warehouseProductId, uniqueId) => {
    const { eanCode, serialNumber } = inputValues[uniqueId] || {};
    try {
      const response = await axios.put(
        `${backendUrl}/api/warehouse-products/update/${warehouseProductId}`, // Use warehouse product ID here
        { eanCode, serialNumber }
      );
      if (response.data.success) {
        toast.success("Údaje produktu boli uložené");
      } else {
        toast.error("Nepodarilo sa uložiť údaje produktu");
      }
    } catch (error) {
      toast.error("Chyba pri ukladaní údajov produktu");
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Sklad</h1>

      {/* Category and Subcategory Filters */}
      <div className="mb-4">
        <label className="mr-2">Kategória:</label>
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Vyberte kategóriu</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <>
            <label className="ml-4 mr-2">Podkategória:</label>
            <select
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
            >
              <option value="">Všetky podkategórie</option>
              {[...categories[selectedCategory]].map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

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
          {Object.keys(filteredData).map((category) =>
            Object.keys(filteredData[category]).map((subCategory) => (
              <React.Fragment key={`${category}-${subCategory}`}>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">
                    {category || "Unknown Category"} {/* Safeguard */}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {subCategory || "General"} {/* Safeguard */}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {filteredData[category][subCategory].length}
                  </td>
                  <td className="border border-gray-200 px-4 py-2"></td>
                </tr>
                {filteredData[category][subCategory].map((product, index) => (
                  <tr
                    key={`${product.uniqueId}-${index}`}
                    className={
                      isProductOutOfStock(product) ? "bg-gray-300" : ""
                    }
                  >
                    <td
                      className="border border-gray-200 px-4 py-2"
                      colSpan="3"
                    >
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <span className="font-bold">
                            {product.name || "Unknown Product"}{" "}
                            {/* Safeguard */}
                          </span>
                          <div>
                            <span>
                              {product.condition === "new" ? "Nový" : "Použitý"}
                            </span>
                            <span className="ml-4">
                              (
                              {product.location === "in stock"
                                ? "Na sklade"
                                : "Na predajni"}
                              )
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm">EAN kód</label>
                          <input
                            onChange={(e) =>
                              handleInputChange(
                                product.uniqueId,
                                "eanCode",
                                e.target.value
                              )
                            }
                            value={
                              inputValues[product.uniqueId]?.eanCode ||
                              product.eanCode ||
                              ""
                            }
                            className="w-full max-w-[150px] px-3 py-2"
                            type="text"
                            placeholder="EAN kód"
                          />
                        </div>
                        {product.category === "Mobily" ||
                        product.category === "Herné konzoly" ? (
                          <div className="flex flex-col">
                            <label className="text-sm">S/N</label>
                            <input
                              onChange={(e) =>
                                handleInputChange(
                                  product.uniqueId,
                                  "serialNumber",
                                  e.target.value
                                )
                              }
                              value={
                                inputValues[product.uniqueId]?.serialNumber ||
                                product.serialNumber ||
                                ""
                              }
                              className="w-full max-w-[150px] px-3 py-2"
                              type="text"
                              placeholder="S/N"
                            />
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        onClick={() =>
                          saveProductDetails(
                            product.warehouseProductId,
                            product.uniqueId
                          )
                        }
                        className="text-blue-500"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/warehouse/edit/${product._id}`)
                        }
                        className="ml-4 text-green-500"
                      >
                        <FaEdit />
                      </button>
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
