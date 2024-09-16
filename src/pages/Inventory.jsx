import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState({ stock: [], store: [] });
  const [eanCode, setEanCode] = useState("");
  const [activeTab, setActiveTab] = useState("stock"); // 'stock' or 'store'
  const navigate = useNavigate(); // Initialize navigate
  const [storeWarehouseId, setStoreWarehouseId] = useState(null); // State for store warehouse ID

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/warehouse/list`, {
        headers: { token },
      });

      if (response.data.success) {
        const warehouses = response.data.warehouses;

        const stockProducts = [];
        const storeProducts = [];

        // Iterate over the warehouses to extract products and quantities
        for (const category in warehouses) {
          const subCategories = warehouses[category];
          for (const subCategory in subCategories) {
            const productsArray = subCategories[subCategory];

            productsArray.forEach((productData) => {
              const product = productData.product;
              const warehouseInfo = productData;

              // Add warehouse quantities to the product
              product.warehouse = warehouseInfo;

              // Determine placement based on quantities
              const inStock =
                warehouseInfo.quantityInStock.new > 0 ||
                warehouseInfo.quantityInStock.used > 0;
              const inStore =
                warehouseInfo.quantityInStore.new > 0 ||
                warehouseInfo.quantityInStore.used > 0;

              if (inStock) {
                stockProducts.push(product);
              }
              if (inStore) {
                storeProducts.push(product);
              }
            });
          }
        }

        setProducts({
          stock: stockProducts,
          store: storeProducts,
        });
      } else {
        toast.error("Nepodarilo sa načítať produkty zo skladu");
      }
    } catch (error) {
      console.error("Chyba pri načítaní produktov zo skladu:", error);
      toast.error("Chyba pri načítaní produktov zo skladu");
    }
  };

  const handleScan = () => {
    if (eanCode === "") {
      return toast.error("Zadajte EAN kód");
    }

    setProducts((prevProducts) => {
      const updatedProducts = { ...prevProducts };
      updatedProducts[activeTab] = prevProducts[activeTab].filter(
        (product) => product.eanCode !== eanCode
      );
      return updatedProducts;
    });

    setEanCode("");
  };

  const handleAdd = async () => {
    if (eanCode.trim() === "") {
      return toast.error("Zadajte EAN kód");
    }

    try {
      // Combine stock and store products
      const allProducts = [...products.stock, ...products.store];
      const product = allProducts.find((prod) => prod.eanCode === eanCode);

      if (product) {
        // Product exists, update the warehouse quantities
        const location = activeTab === "store" ? "store" : "stock";
        const condition = product.condition || "new"; // Use product's condition or default to 'new'

        // Call the backend endpoint to update the product quantity
        const updateResponse = await axios.post(
          `${backendUrl}/api/product/update-quantity`,
          {
            productId: product._id,
            location: location,
            amount: 1, // Increase by 1
            condition: condition,
          },
          {
            headers: { token },
          }
        );

        if (updateResponse.data.success) {
          toast.success("Množstvo produktu bolo aktualizované");
          await fetchProducts(); // Refresh product list
        } else {
          toast.error(
            updateResponse.data.message ||
              "Nepodarilo sa aktualizovať množstvo produktu"
          );
        }
      } else {
        // Product does not exist, redirect to Add.jsx
        navigate("/add", { state: { eanCode } });
      }
    } catch (error) {
      console.error("Chyba pri spracovaní EAN kódu:", error);
      toast.error("Chyba pri spracovaní EAN kódu");
    }

    setEanCode("");
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Inventúra</h1>
      {/* Tabs */}
      <div className="mb-4">
        <button
          onClick={() => setActiveTab("stock")}
          className={`py-2 px-4 ${
            activeTab === "stock" ? "bg-[#a7db28] text-white" : "bg-gray-200"
          } rounded-l-md`}
        >
          Sklad
        </button>
        <button
          onClick={() => setActiveTab("store")}
          className={`py-2 px-4 ${
            activeTab === "store" ? "bg-[#a7db28] text-white" : "bg-gray-200"
          } rounded-r-md`}
        >
          Predajňa
        </button>
      </div>

      {/* EAN Code Input */}
      <div className="mb-4">
        <input
          type="text"
          value={eanCode}
          onChange={(e) => setEanCode(e.target.value)}
          placeholder="EAN kód"
          className="px-3 py-2 border border-gray-300"
        />
        <button
          onClick={handleScan}
          className="ml-2 py-2 px-4 bg-[#a7db28] text-white rounded-md"
        >
          Skenovať
        </button>

        <button
          onClick={handleAdd}
          className="ml-2 py-2 px-4 bg-[#a7db28] text-white rounded-md"
        >
          Pridať nový produkt
        </button>
      </div>

      {/* Product List */}
      {activeTab === "stock" && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Produkty na sklade</h2>
          {products.stock.length > 0 ? (
            <ProductTable products={products.stock} />
          ) : (
            <p>Žiadne produkty na sklade.</p>
          )}
        </div>
      )}
      {activeTab === "store" && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Produkty na predajni</h2>
          {products.store.length > 0 ? (
            <ProductTable products={products.store} />
          ) : (
            <p>Žiadne produkty na predajni.</p>
          )}
        </div>
      )}
    </div>
  );
};

const ProductTable = ({ products }) => (
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
          <td className="border border-gray-200 px-4 py-2">{product.name}</td>
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
);

export default Inventory;
