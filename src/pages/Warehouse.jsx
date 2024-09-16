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
  const [inputValues, setInputValues] = useState({}); // Store EAN and Serial Number inputs for each warehouse product entry
  const navigate = useNavigate(); // To navigate to the edit page

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/warehouse-products`);
      if (response.data.success) {
        const categorizedData = categorizeWarehouseProducts(
          response.data.products
        );
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

  const categorizeWarehouseProducts = (warehouseProducts) => {
    const categories = {};

    warehouseProducts.forEach((warehouseProduct) => {
      const { product } = warehouseProduct;

      // Skip if product is null
      if (!product) {
        console.warn(
          "Missing product data for warehouseProduct:",
          warehouseProduct
        );
        return;
      }

      const { category, subCategory } = product;

      if (!categories[category]) {
        categories[category] = {};
      }
      if (!categories[category][subCategory]) {
        categories[category][subCategory] = [];
      }

      // Push each individual warehouse product into the category/subcategory group
      categories[category][subCategory].push({
        ...warehouseProduct,
        warehouseProductId: warehouseProduct._id,
        productName: product.name,
        uniqueId: `${warehouseProduct._id}-${warehouseProduct.condition}-${warehouseProduct.location}`,
      });
    });

    return categories;
  };

  const getUniqueCategories = (warehouseProducts) => {
    const uniqueCategories = {};

    warehouseProducts.forEach((warehouseProduct) => {
      const { product } = warehouseProduct;

      // Skip if product is null
      if (!product) {
        return;
      }

      const { category, subCategory } = product;
      if (!uniqueCategories[category]) {
        uniqueCategories[category] = new Set();
      }
      uniqueCategories[category].add(subCategory || "General");
    });

    return uniqueCategories;
  };

  const isProductOutOfStock = (product) => {
    return (
      product.warehouse?.quantityInStock?.new === 0 &&
      product.warehouse?.quantityInStock?.used === 0 &&
      product.warehouse?.quantityInStore?.new === 0 &&
      product.warehouse?.quantityInStore?.used === 0
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

  const saveProductDetails = async (
    warehouseProductId,
    uniqueId,
    condition,
    location
  ) => {
    const { eanCode, serialNumber } = inputValues[uniqueId] || {};
    try {
      const response = await axios.put(
        `${backendUrl}/api/warehouse-products/update/${warehouseProductId}`,
        {
          eanCode,
          serialNumber,
          condition,
          location,
        }
      );
      if (response.data.success) {
        toast.success("Údaje produktu boli uložené");
      } else {
        toast.error("Nepodarilo sa uložiť údaje produktu");
      }
    } catch (error) {
      console.warn(error);
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
                    {category || "Unknown Category"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {subCategory || "General"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {filteredData[category][subCategory].length}
                  </td>
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
                            {product.productName || "Unknown Product"}
                          </span>
                          <div>
                            <span>
                              {product.condition === "new" ? "New" : "Used"}
                            </span>
                            <span className="ml-4">
                              (
                              {product.location === "in stock"
                                ? "In Stock"
                                : "In Store"}
                              )
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm">EAN</label>
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
                            placeholder="EAN"
                          />
                        </div>
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
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        onClick={() =>
                          saveProductDetails(
                            product.warehouseProductId,
                            product.uniqueId,
                            product.condition,
                            product.location
                          )
                        }
                        className="text-blue-500"
                      >
                        <FaSave />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/warehouse/edit/${product.product._id}`)
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
