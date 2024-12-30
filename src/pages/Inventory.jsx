// Inventory.jsx
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
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eanCodeList, setEanCodeList] = useState([]);
  const [newEanCode, setNewEanCode] = useState("");

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

              // Determine placement based on quantities
              const inStock =
                warehouseInfo.quantityInStock.new > 0 ||
                warehouseInfo.quantityInStock.used > 0;
              const inStore =
                warehouseInfo.quantityInStore.new > 0 ||
                warehouseInfo.quantityInStore.used > 0;

              // Expand products based on quantity
              if (inStock) {
                for (let i = 0; i < warehouseInfo.quantityInStock.new; i++) {
                  stockProducts.push({ ...productData, condition: "new" });
                }
                for (let i = 0; i < warehouseInfo.quantityInStock.used; i++) {
                  stockProducts.push({ ...productData, condition: "used" });
                }
              }
              if (inStore) {
                for (let i = 0; i < warehouseInfo.quantityInStore.new; i++) {
                  storeProducts.push({ ...productData, condition: "new" });
                }
                for (let i = 0; i < warehouseInfo.quantityInStore.used; i++) {
                  storeProducts.push({ ...productData, condition: "used" });
                }
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
      const productList = [...updatedProducts[activeTab]];

      // Find the index of the first product with the matching EAN code
      const index = productList.findIndex(
        (productData) => productData.product.eanCode === eanCode
      );

      if (index !== -1) {
        productList.splice(index, 1); // Remove one product at the found index
        updatedProducts[activeTab] = productList;
      } else {
        toast.error("Produkt s daným EAN kódom nebol nájdený");
      }

      return updatedProducts;
    });

    setEanCode("");
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setEanCodeList([]);
    setNewEanCode("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEanCodeList([]);
    setNewEanCode("");
  };

  const handleAddEanCode = () => {
    if (newEanCode.trim() !== "") {
      setEanCodeList((prevList) => [...prevList, newEanCode.trim()]);
      setNewEanCode("");
    }
  };

  const handleAddAll = async () => {
    const existingProducts = [];
    const newProducts = [];

    // Fetch all products to check for existing EAN codes
    try {
      const allProductsResponse = await axios.get(
        `${backendUrl}/api/product/list`,
        {
          headers: { token },
        }
      );

      const allProducts = allProductsResponse.data.products;

      for (const code of eanCodeList) {
        const productData = allProducts.find((prod) => prod.eanCode === code);

        if (productData) {
          existingProducts.push({ code, productData });
        } else {
          newProducts.push(code);
        }
      }

      // Add existing products
      for (const item of existingProducts) {
        const product = item.productData;
        const location = activeTab === "store" ? "store" : "stock";
        const condition = "new"; // Adjust as necessary

        // Update the product quantity
        await axios.post(
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
      }

      if (existingProducts.length > 0) {
        toast.success("Množstvo existujúcich produktov bolo aktualizované");
      }

      // Open new tabs for new products
      for (const code of newProducts) {
        window.open(`/add?eanCode=${code}`, "_blank");
      }

      if (newProducts.length > 0) {
        toast.info(
          `${newProducts.length} nových produktov bolo otvorených v nových kartách`
        );
      }

      await fetchProducts(); // Refresh the product list
      handleCloseDialog();
    } catch (error) {
      console.error("Chyba pri pridávaní produktov:", error);
      toast.error("Chyba pri pridávaní produktov");
    }
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
          onClick={handleOpenDialog}
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

      {/* Dialog for adding multiple EAN codes */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Pridať nové produkty</h2>
            <div className="mb-4">
              <input
                type="text"
                value={newEanCode}
                onChange={(e) => setNewEanCode(e.target.value)}
                placeholder="EAN kód"
                className="px-3 py-2 border border-gray-300 w-full"
              />
              <button
                onClick={handleAddEanCode}
                className="mt-2 py-2 px-4 bg-[#a7db28] text-white rounded-md w-full"
              >
                Pridať EAN kód do zoznamu
              </button>
            </div>
            {eanCodeList.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Zoznam EAN kódov:</h3>
                <ul className="list-disc list-inside">
                  {eanCodeList.map((code, index) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleAddAll}
                className="py-2 px-4 bg-[#a7db28] text-white rounded-md mr-2"
              >
                Pridať všetky
              </button>
              <button
                onClick={handleCloseDialog}
                className="py-2 px-4 bg-gray-300 rounded-md"
              >
                Zrušiť
              </button>
            </div>
          </div>
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
        <th className="border border-gray-200 px-4 py-2">Stav</th>
      </tr>
    </thead>
    <tbody>
      {products.map((productData, index) => {
        const { product, condition } = productData;

        return (
          <tr key={`${product._id}-${index}`}>
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
            <td className="border border-gray-200 px-4 py-2 capitalize">
              {condition}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export default Inventory;
