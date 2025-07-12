import { useState } from "react";
import { Link } from "react-router-dom";

function RetailerDashboard({ user, onLogout }) {

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center py-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Retailer Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.name}!</p>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
          <Link to="/scanner">Go to Scanner</Link>
          </button>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>
        
      </div>
    </div>
  );
}

export default RetailerDashboard;
