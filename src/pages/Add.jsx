import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { FaTimes, FaSpinner } from "react-icons/fa";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [description2, setDescription2] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [bestseller, setBestseller] = useState(false);
  const [inStore, setInStore] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [condition, setCondition] = useState("new"); // New field for condition

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");

  const [quantityInStore, setQuantityInStore] = useState(0);
  const [quantityInStock, setQuantityInStock] = useState(0);
  const [quantityUsedInStore, setQuantityUsedInStore] = useState(0);
  const [quantityUsedInStock, setQuantityUsedInStock] = useState(0);
  const [eanCode, setEanCode] = useState(""); // New EAN Code field

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (newCategory) {
      addNewCategory();
    }
  }, [newCategory]);

  useEffect(() => {
    if (newSubCategory) {
      addNewSubCategory();
    }
  }, [newSubCategory]);

  useEffect(() => {
    if (category) {
      fetchSubCategories(category);
    }
  }, [category]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Nepodarilo sa načítať kategórie");
    }
  };

  const fetchSubCategories = async (categoryName) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/category/subcategories/${categoryName}`
      );
      if (response.data.success) {
        setSubCategoryList(response.data.subCategories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Nepodarilo sa načítať podkategórie");
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Názov kategórie nemôže byť prázdny");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/category/add",
        { name: newCategory },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setNewCategory(""); // Clear the input field after successful addition
        fetchCategories(); // Refresh categories list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Nepodarilo sa pridať kategóriu");
    }
  };

  const addNewSubCategory = async () => {
    if (!newSubCategory.trim()) {
      toast.error("Názov podkategórie nemôže byť prázdny");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/category/subcategory/add",
        { categoryName: category, subCategoryName: newSubCategory },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setNewSubCategory("");
        fetchSubCategories(category); // Refresh subcategories list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Nepodarilo sa pridať podkategóriu");
    }
  };

  const deleteCategory = async (categoryName) => {
    if (
      window.confirm(`Naozaj chcete vymazať túto kategóriu: ${categoryName}?`)
    ) {
      try {
        const response = await axios.post(
          backendUrl + "/api/category/delete",
          { name: categoryName },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchCategories(); // Refresh categories list
          if (category === categoryName) {
            setCategory("");
            setSubCategoryList([]);
          }
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Nepodarilo sa vymazať kategóriu");
      }
    }
  };

  const deleteSubCategory = async (subCategoryName) => {
    if (
      window.confirm(
        `Naozaj chcete vymazať túto podkategóriu: ${subCategoryName}?`
      )
    ) {
      try {
        const response = await axios.post(
          backendUrl + "/api/category/subcategory/delete",
          { categoryName: category, subCategoryName: subCategoryName },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchSubCategories(category); // Refresh subcategories list
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Nepodarilo sa vymazať podkategóriu");
      }
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("description2", description2);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory || "");
      formData.append("bestseller", bestseller);
      formData.append("inStore", inStore);
      formData.append("inStock", inStock);
      formData.append("condition", condition); // Use condition field
      formData.append("quantityInStore", quantityInStore);
      formData.append("quantityInStock", quantityInStock);
      formData.append("quantityUsedInStore", quantityUsedInStore);
      formData.append("quantityUsedInStock", quantityUsedInStock);
      formData.append("eanCode", eanCode);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setLoading(false);
        setName("");
        setDescription("");
        setDescription2("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setCondition("new"); // Reset condition to default
        setQuantityInStore(0);
        setQuantityInStock(0);
        setQuantityUsedInStore(0);
        setQuantityUsedInStock(0);
        setEanCode("");
        setCategory("");
        setSubCategory("");
      } else {
        toast.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubCategory(""); // Reset subcategory when category changes
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Pridať fotky produktu</p>

        <div className="flex gap-2">
          <label htmlFor="image1">
            <img
              className="w-20"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt=""
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              hidden
            />
          </label>
          <label htmlFor="image2">
            <img
              className="w-20"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt=""
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
            />
          </label>
          <label htmlFor="image3">
            <img
              className="w-20"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt=""
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
            />
          </label>
          <label htmlFor="image4">
            <img
              className="w-20"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt=""
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
            />
          </label>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Názov produktu</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Sem zadajte názov"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Popis produktu</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Sem zadajte popis produktu"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Popis produktu 2 (nepovinné)</p>
        <textarea
          onChange={(e) => setDescription2(e.target.value)}
          value={description2}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Sem zadajte druhý popis produktu"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Kategória produktu</p>
          <div className="flex items-center">
            <select
              onChange={handleCategoryChange}
              value={category}
              className="w-full px-3 py-2"
            >
              <option value="">Vyberte kategóriu</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ml-2 text-blue-600"
              onClick={() => {
                const newCat = prompt("Zadajte názov novej kategórie:");
                if (newCat) {
                  setNewCategory(newCat);
                }
              }}
            >
              +
            </button>
            {category && (
              <FaTimes
                className="ml-2 text-red-600 cursor-pointer"
                onClick={() => deleteCategory(category)}
              />
            )}
          </div>
        </div>

        <div>
          <p className="mb-2">Podkategória produktu</p>
          <div className="flex items-center">
            <select
              onChange={(e) => setSubCategory(e.target.value)}
              value={subCategory}
              className="w-full px-3 py-2"
            >
              <option value="">Vyberte podkategóriu</option>
              {subCategoryList.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ml-2 text-blue-600"
              onClick={() => {
                const newSubCat = prompt("Zadajte názov novej podkategórie:");
                if (newSubCat) {
                  setNewSubCategory(newSubCat);
                }
              }}
            >
              +
            </button>
            {subCategory && (
              <FaTimes
                className="ml-2 text-red-600 cursor-pointer"
                onClick={() => deleteSubCategory(subCategory)}
              />
            )}
          </div>
        </div>

        <div>
          <p className="mb-2">Cena produktu</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="100"
          />
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Stav produktu</p>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full px-3 py-2"
        >
          <option value="new">Nový</option>
          <option value="used">Použitý</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div className="flex gap-2 mt-2">
          <input
            onChange={() => setBestseller((prev) => !prev)}
            checked={bestseller}
            type="checkbox"
            id="bestseller"
          />
          <label className="cursor-pointer" htmlFor="bestseller">
            Označiť ako bestseller
          </label>
        </div>

        <div className="flex gap-2 mt-2">
          <input
            onChange={() => setInStore((prev) => !prev)}
            checked={inStore}
            type="checkbox"
            id="inStore"
          />
          <label className="cursor-pointer" htmlFor="inStore">
            Dostupný v obchode
          </label>
        </div>

        <div className="flex gap-2 mt-2">
          <input
            onChange={() => setInStock((prev) => !prev)}
            checked={inStock}
            type="checkbox"
            id="inStock"
          />
          <label className="cursor-pointer" htmlFor="inStock">
            Dostupný v sklade
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Počet nových kusov v obchode</p>
          <input
            onChange={(e) => setQuantityInStore(e.target.value)}
            value={quantityInStore}
            className="w-full max-w-[500px] px-3 py-2"
            type="number"
            placeholder="Počet kusov v obchode"
          />
        </div>

        <div>
          <p className="mb-2">Počet nových kusov na sklade</p>
          <input
            onChange={(e) => setQuantityInStock(e.target.value)}
            value={quantityInStock}
            className="w-full max-w-[500px] px-3 py-2"
            type="number"
            placeholder="Počet kusov na sklade"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Počet použitých kusov v obchode</p>
          <input
            onChange={(e) => setQuantityUsedInStore(e.target.value)}
            value={quantityUsedInStore}
            className="w-full max-w-[500px] px-3 py-2"
            type="number"
            placeholder="Počet použitých kusov v obchode"
          />
        </div>

        <div>
          <p className="mb-2">Počet použitých kusov na sklade</p>
          <input
            onChange={(e) => setQuantityUsedInStock(e.target.value)}
            value={quantityUsedInStock}
            className="w-full max-w-[500px] px-3 py-2"
            type="number"
            placeholder="Počet použitých kusov na sklade"
          />
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">EAN kód produktu (nepovinné)</p>
        <input
          onChange={(e) => setEanCode(e.target.value)}
          value={eanCode}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Sem zadajte EAN kód produktu"
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        className={`w-40 py-3 mt-4 bg-black text-white flex items-center justify-center gap-2 ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            Načítava sa...
          </>
        ) : (
          "Pridať"
        )}
      </button>
    </form>
  );
};

export default Add;
