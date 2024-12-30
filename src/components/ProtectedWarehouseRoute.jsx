import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthPasswordPrompt from "./AuthPasswordPrompt";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const ProtectedWarehouseRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const location = useLocation();

  // Check if we're coming from the warehouse page with authorization
  useEffect(() => {
    const isPreAuthorized = location.state?.isAuthorized;
    if (isPreAuthorized) {
      setIsAuthorized(true);
      setShowPrompt(false);
    }
  }, [location]);

  const handleAuth = async (password) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/warehouse/verify-auth`,
        {
          authPassword: password,
        }
      );

      if (response.data.success) {
        setIsAuthorized(true);
        setShowPrompt(false);
      } else {
        toast.error("Zlé autorizačné heslo");
      }
    } catch (error) {
      console.error("Autorizácia zlyhala:", error);
      toast.error("Autorizácia zlyhala");
    }
  };

  if (!isAuthorized && showPrompt) {
    return (
      <AuthPasswordPrompt
        onSubmit={handleAuth}
        onCancel={() => {
          setShowPrompt(false);
          window.history.back();
        }}
      />
    );
  }

  if (!isAuthorized && !showPrompt) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedWarehouseRoute;
