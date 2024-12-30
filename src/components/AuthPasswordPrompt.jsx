import React, { useState } from "react";

const AuthPasswordPrompt = ({ onSubmit, onCancel }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Je potrebná autorizácia</h2>
        <p className="mb-4">Prosím, zadajte autorizačné heslo.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
            placeholder="Zadajte autorizačné heslo"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#a7db28] text-white rounded"
            >
              Odoslať
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPasswordPrompt;
