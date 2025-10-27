// src/components/ui/button.jsx
import React from "react";

export const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-5 py-2 rounded-full font-semibold transition ${className}`}
    {...props}
  >
    {children}
  </button>
);
