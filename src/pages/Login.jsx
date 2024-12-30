const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${backendUrl}/api/admin/login`, {
      email,
      password,
    });

    if (response.data.success) {
      const token = response.data.token;
      localStorage.setItem("adminToken", token); // Store token in localStorage
      setToken(token); // Update token in your global state
      navigate("/add");
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Prihlásenie zlyhalo");
  }
};
