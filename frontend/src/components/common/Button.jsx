import React from "react";

const Button = ({
  children,
  type = "button",
  className = "",
  loading = false,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600 text-white"
      } ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
