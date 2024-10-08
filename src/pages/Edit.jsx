import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import * as Showdown from "showdown";
import { FaTimes } from "react-icons/fa";

const Edit = ({ token }) => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [description2, setDescription2] = useState("");
  const [selectedTab, setSelectedTab] = useState("write"); // For ReactMde
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [condition, setCondition] = useState(""); // Added condition state
  const [eanCode, setEanCode] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  const price = "0";

  const [bestseller, setBestseller] = useState(false);

  const [serialNumber, setSerialNumber] = useState("");
  const [productClass, setProductClass] = useState("");

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");

  const classOptions = [
    { value: "A", label: "Trieda A (brand new)" },
    { value: "B", label: "Trieda B (used without issues)" },
    { value: "C", label: "Trieda C (scratches etc.)" },
  ];

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

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

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/${id}`);
      if (response.data.success) {
        const product = response.data.product;
        setProduct(product);
        setName(product.name);
        setDescription(product.description);
        setDescription2(product.description2 || "");
        setBestseller(product.bestseller);
        setCategory(product.category);
        setSubCategory(product.subCategory);
        setYoutubeLink(product.youtubeLink || "");
        setEanCode(product.eanCode || "");
        setSerialNumber(product.serialNumber || "");
        setProductClass(product.class || "");
        setCondition(product.condition || ""); // Set condition if it exists

        // Handle images
        if (product.image && product.image.length > 0) {
          setImage1(product.image[0] || null);
          setImage2(product.image[1] || null);
          setImage3(product.image[2] || null);
          setImage4(product.image[3] || null);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Nepodarilo sa načítať detaily produktu.");
    }
  };

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

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("description2", description2); // Include description2
      formData.append("category", category);
      formData.append("subCategory", subCategory || "");
      formData.append("bestseller", bestseller);
      formData.append("youtubeLink", youtubeLink || "");
      formData.append("eanCode", eanCode || ""); // Include EAN code
      formData.append("serialNumber", serialNumber || "");
      formData.append("class", productClass || "");
      formData.append("condition", condition || ""); // Include condition if applicable

      // Handle image files
      if (image1 instanceof File) {
        formData.append("image1", image1);
      } else if (image1 && typeof image1 === "string") {
        formData.append("existingImage1", image1);
      }

      if (image2 instanceof File) {
        formData.append("image2", image2);
      } else if (image2 && typeof image2 === "string") {
        formData.append("existingImage2", image2);
      }

      if (image3 instanceof File) {
        formData.append("image3", image3);
      } else if (image3 && typeof image3 === "string") {
        formData.append("existingImage3", image3);
      }

      if (image4 instanceof File) {
        formData.append("image4", image4);
      } else if (image4 && typeof image4 === "string") {
        formData.append("existingImage4", image4);
      }

      const response = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Produkt úspešne aktualizovaný");
        navigate("/list"); // Redirect back to the product list after updating
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Nepodarilo sa aktualizovať produkt");
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

  if (!product) return <div>Načítávam...</div>;

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
              src={
                image1
                  ? image1 instanceof File
                    ? URL.createObjectURL(image1)
                    : `${backendUrl}/${image1}`
                  : assets.upload_area
              }
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
              src={
                image2
                  ? image2 instanceof File
                    ? URL.createObjectURL(image2)
                    : `${backendUrl}/${image2}`
                  : assets.upload_area
              }
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
              src={
                image3
                  ? image3 instanceof File
                    ? URL.createObjectURL(image3)
                    : `${backendUrl}/${image3}`
                  : assets.upload_area
              }
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
              src={
                image4
                  ? image4 instanceof File
                    ? URL.createObjectURL(image4)
                    : `${backendUrl}/${image4}`
                  : assets.upload_area
              }
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
        <ReactMde
          value={description2}
          onChange={setDescription2}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          generateMarkdownPreview={(markdown) =>
            Promise.resolve(converter.makeHtml(markdown))
          }
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
      </div>

      {/* If you have condition field for products */}
      <div className="w-full">
        <p className="mb-2">Stav produktu</p>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full px-3 py-2"
        >
          <option value="">Vyberte stav</option>
          <option value="new">Nový</option>
          <option value="used">Použitý</option>
        </select>
      </div>

      {["Herné konzoly", "Mobily"].includes(category) && (
        <div className="w-full">
          <p className="mb-2">Sériové číslo (S/N)</p>
          <input
            onChange={(e) => setSerialNumber(e.target.value)}
            value={serialNumber}
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Sem zadajte sériové číslo"
          />
        </div>
      )}

      {category === "Mobily" && (
        <div className="w-full">
          <p className="mb-2">Trieda</p>
          <select
            value={productClass}
            onChange={(e) => setProductClass(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="">Vyberte triedu</option>
            {classOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {category === "Hry" && (
        <div className="w-full">
          <p className="mb-2">Link na YouTube Trailer (nepovinné)</p>
          <input
            onChange={(e) => setYoutubeLink(e.target.value)}
            value={youtubeLink}
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Sem zadajte YouTube link"
          />
        </div>
      )}

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

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        Aktualizovať
      </button>
    </form>
  );
};

export default Edit;
