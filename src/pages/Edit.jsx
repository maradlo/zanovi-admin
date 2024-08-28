import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

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
  const [description2, setDescription2] = useState(""); // New field for description2
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [inStore, setInStore] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [bestseller, setBestseller] = useState(false); // Define bestseller state
  const [condition, setCondition] = useState("new"); // Condition (new/used)
  const [eanCode, setEanCode] = useState(""); // New field for EAN code

  const [quantityInStore, setQuantityInStore] = useState(0);
  const [quantityInStock, setQuantityInStock] = useState(0);
  const [quantityUsedInStore, setQuantityUsedInStore] = useState(0); // New field for used products in store
  const [quantityUsedInStock, setQuantityUsedInStock] = useState(0); // New field for used products in stock

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/${id}`);
      if (response.data.success) {
        const product = response.data.product;
        setProduct(product);
        setName(product.name);
        setDescription(product.description);
        setDescription2(product.description2 || ""); // Set description2
        setPrice(product.price);
        setCategory(product.category);
        setSubCategory(product.subCategory);
        setInStore(product.inStore);
        setInStock(product.inStock);
        setBestseller(product.bestseller); // Set bestseller state
        setCondition(product.condition); // Set condition
        setQuantityInStore(product.quantityInStore);
        setQuantityInStock(product.quantityInStock);
        setQuantityUsedInStore(product.quantityUsedInStore || 0); // Set quantityUsedInStore
        setQuantityUsedInStock(product.quantityUsedInStock || 0); // Set quantityUsedInStock
        setEanCode(product.eanCode || ""); // Set EAN code if exists
        if (product.image && product.image.length > 0) {
          setImage1(product.image[0]);
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("description2", description2); // Include description2
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory || "");
      formData.append("bestseller", bestseller); // Include bestseller in the form data
      formData.append("condition", condition); // Use condition directly
      formData.append("inStore", inStore);
      formData.append("inStock", inStock);
      formData.append("quantityInStore", quantityInStore);
      formData.append("quantityInStock", quantityInStock);
      formData.append("quantityUsedInStore", quantityUsedInStore); // Include quantityUsedInStore
      formData.append("quantityUsedInStock", quantityUsedInStock); // Include quantityUsedInStock
      formData.append("eanCode", eanCode); // Include EAN code

      if (image1 instanceof File) formData.append("image1", image1);
      if (image2 instanceof File) formData.append("image2", image2);
      if (image3 instanceof File) formData.append("image3", image3);
      if (image4 instanceof File) formData.append("image4", image4);

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
                    : image1
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
                    : image2
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
                    : image3
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
                    : image4
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
          <input
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2"
            type="text"
            placeholder="Kategória"
            required
          />
        </div>

        <div>
          <p className="mb-2">Podkategória produktu</p>
          <input
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2"
            type="text"
            placeholder="Podkategória"
          />
        </div>

        <div>
          <p className="mb-2">Cena produktu</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="Cena"
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

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        Aktualizovať
      </button>
    </form>
  );
};

export default Edit;
