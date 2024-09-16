import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import {
  FaSave,
  FaEdit,
  FaTrash,
  FaExpand,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Warehouse = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [categories, setCategories] = useState([]); // To store unique categories
  const [filteredData, setFilteredData] = useState([]); // For filtering products
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category filter
  const [selectedSubCategory, setSelectedSubCategory] = useState(""); // Selected subcategory filter
  const [inputValues, setInputValues] = useState({}); // Store EAN and Serial Number inputs
  const [expandedProducts, setExpandedProducts] = useState({});
  const [warehouseProducts, setWarehouseProducts] = useState({});
  const navigate = useNavigate(); // To navigate to the edit page

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/warehouse/list`);
      if (response.data.success) {
        const categorizedData = categorizeWarehouseEntries(
          response.data.warehouses
        );
        setWarehouseData(categorizedData);
        setFilteredData(categorizedData); // Initialize filtered data with all products
        setCategories(getUniqueCategories(response.data.warehouses)); // Store unique categories
      } else {
        toast.error("Nepodarilo sa načítať dáta skladu");
      }
    } catch (error) {
      console.error("Chyba pri načítaní dát skladu:", error);
      toast.error("Nepodarilo sa načítať dáta skladu");
    }
  };

  const categorizeWarehouseEntries = (warehouses) => {
    const categories = {};

    Object.keys(warehouses).forEach((category) => {
      if (!categories[category]) {
        categories[category] = {};
      }
      Object.keys(warehouses[category]).forEach((subCategory) => {
        if (!categories[category][subCategory]) {
          categories[category][subCategory] = [];
        }

        warehouses[category][subCategory].forEach((warehouse) => {
          const product = warehouse.product;

          if (!product) {
            warn(`Warehouse entry ${warehouse._id} has no product`);
            console.return;
          }

          categories[category][subCategory].push({
            ...warehouse,
            productName: product.name,
            uniqueId: warehouse._id,
          });
        });
      });
    });

    return categories;
  };

  const getUniqueCategories = (warehouses) => {
    const uniqueCategories = {};

    Object.keys(warehouses).forEach((category) => {
      uniqueCategories[category] = new Set(
        Object.keys(warehouses[category]) || ["General"]
      );
    });

    return uniqueCategories;
  };

  const deleteWarehouseProduct = async (warehouseProductId, productId) => {
    if (window.confirm("Naozaj chcete vymazať tento produkt zo skladu?")) {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/warehouse-products/remove/${warehouseProductId}`,
          {
            data: {
              productId,
            },
          }
        );
        if (response.data.success) {
          toast.success("Produkt bol vymazaný zo skladu");
          // Update the state to remove the deleted product
          setWarehouseProducts((prev) => {
            const updatedProducts = { ...prev };
            updatedProducts[productId] = updatedProducts[productId].filter(
              (wp) => wp._id !== warehouseProductId
            );
            return updatedProducts;
          });
          // Optionally, refresh warehouse data to update quantities
          fetchWarehouseData();
        } else {
          toast.error("Nepodarilo sa vymazať produkt zo skladu");
        }
      } catch (error) {
        console.error("Chyba pri vymazávaní produktu zo skladu:", error);
        toast.error("Nepodarilo sa vymazať produkt zo skladu");
      }
    }
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

  const handleExpandProduct = async (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));

    if (!warehouseProducts[productId]) {
      // Fetch warehouseProducts for this product
      try {
        const response = await axios.get(
          `${backendUrl}/api/warehouse-products/product/${productId}`
        );
        if (response.data.success) {
          setWarehouseProducts((prev) => ({
            ...prev,
            [productId]: response.data.products,
          }));
        } else {
          toast.error("Nepodarilo sa načítať produkty skladu");
        }
      } catch (error) {
        console.error("Chyba pri načítaní produktov skladu:", error);
        toast.error("Nepodarilo sa načítať produkty skladu");
      }
    }
  };

  const saveProductDetails = async (
    warehouseProductId,
    uniqueId,
    condition,
    location,
    productId
  ) => {
    const { eanCode, serialNumber } = inputValues[uniqueId] || {};
    try {
      // Update the warehouseProduct
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
        // Also update the product's eanCode
        if (eanCode) {
          await axios.put(`${backendUrl}/api/product/update-ean/${productId}`, {
            eanCode,
          });
        }
        // Optionally refresh the warehouseProducts for this product
        await handleExpandProduct(productId);

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
                  <React.Fragment key={`${product.uniqueId}-${index}`}>
                    <tr>
                      <td
                        className="border border-gray-200 px-4 py-2"
                        colSpan="3"
                      >
                        <div className="p-4 flex justify-between items-center">
                          <div>
                            <span className="font-bold">
                              {product.productName || "Unknown Product"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <button
                          onClick={() =>
                            navigate(`/warehouse/edit/${product.product._id}`)
                          }
                          className="ml-4 text-green-500"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            handleExpandProduct(product.product._id)
                          }
                          className="ml-4 text-blue-500"
                        >
                          {expandedProducts[product.product._id] ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedProducts[product.product._id] &&
                      warehouseProducts[product.product._id]?.map((wp) => (
                        <tr key={wp._id}>
                          <td
                            className="border border-gray-200 px-4 py-2"
                            colSpan="3"
                          >
                            <div className="p-4 flex justify-between items-center">
                              <div>
                                <span>
                                  {wp.condition === "new" ? "Nové" : "Použité"}
                                </span>
                                <span className="ml-4">
                                  (
                                  {wp.location === "in stock"
                                    ? "Na sklade"
                                    : "Na predajni"}
                                  )
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-sm">EAN</label>
                                <input
                                  onChange={(e) =>
                                    handleInputChange(
                                      wp._id,
                                      "eanCode",
                                      e.target.value
                                    )
                                  }
                                  value={
                                    inputValues[wp._id]?.eanCode ||
                                    wp.eanCode ||
                                    product.product.eanCode ||
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
                                      wp._id,
                                      "serialNumber",
                                      e.target.value
                                    )
                                  }
                                  value={
                                    inputValues[wp._id]?.serialNumber ||
                                    wp.serialNumber ||
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
                                  wp._id,
                                  wp._id,
                                  wp.condition,
                                  wp.location,
                                  wp.product._id
                                )
                              }
                              className="text-blue-500"
                            >
                              <FaSave />
                            </button>

                            <button
                              onClick={() =>
                                deleteWarehouseProduct(wp._id, wp.product._id)
                              }
                              className="ml-4 text-red-500"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
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
