import React from 'react'

function Unauthorized() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-red-500 text-xl font-bold">
        Access Denied 🚫
      </h1>
    </div>
  );
}

export default Unauthorized;