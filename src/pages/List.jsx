import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    if (window.confirm("Naozaj chcete odstrániť tento produkt?")) {
      try {
        const response = await axios.post(
          backendUrl + "/api/product/remove",
          { id },
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          await fetchList();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const editProduct = (id) => {
    navigate(`/admin/edit/${id}`); // Navigate to the edit page with the product ID
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">Prehľad produktov</p>
      <div className="flex flex-col gap-2">
        {/* ------- List Table Title ---------- */}

        <div className="hidden md:grid grid-cols-[1fr_2fr_2fr_1fr_1fr_1fr_3fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Fotka</b>
          <b>Názov produktu</b>
          <b>Kategória / subkategória</b>
          <b>Cena</b>
          <b>Stav</b>
          <b>Dostupnosť</b>
          <b className="text-center">Akcie</b>
        </div>

        {/* ------ Product List ------ */}

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr_2fr] md:grid-cols-[1fr_2fr_2fr_1fr_1fr_1fr_3fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            {item.image && item.image.length > 0 ? (
              <img className="w-12" src={item.image[0]} alt={item.name} />
            ) : (
              <p>Žiadna fotka</p>
            )}
            <p>{item.name}</p>
            <p>
              {item.category}
              {item.subCategory ? ` / ${item.subCategory}` : ""}
            </p>
            <p>
              {item.price ? item.price : "- "}
              {currency}
            </p>
            <p>{item.condition === "new" ? "Nové" : "Použité"}</p>
            <div>
              {item.condition === "new" && (
                <>
                  <p>Na predajni: {item.quantityInStore}</p>
                  <p>V sklade: {item.quantityInStock}</p>
                </>
              )}
              {item.condition === "used" && (
                <>
                  <p>Na predajni (Použitý): {item.quantityUsedInStore}</p>
                  <p>V sklade (Použitý): {item.quantityUsedInStock}</p>
                </>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <FaPencilAlt
                className="cursor-pointer text-blue-500"
                onClick={() => editProduct(item._id)}
              />
              <FaTrash
                className="cursor-pointer text-red-500"
                onClick={() => removeProduct(item._id)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
