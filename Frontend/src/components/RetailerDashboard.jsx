import { useState } from "react";
import WalmartInventoryDashboard from "../retailerComponents/components/retailer-inventory-component";
function RetailerDashboard({ user, onLogout }) {
  const [formData, setFormData] = useState({
    activity_id: "electricity-supply_grid-source_residual_mix",
    data_version: "^21",
    energy: "",
    energy_unit: "kWh"
  });
  
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch("https://api.climatiq.io/data/v1/estimate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer KP67SC4PYN0ZS9XQ1Z644N5M4G`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emission_factor: {
            activity_id: formData.activity_id,
            data_version: formData.data_version
          },
          parameters: {
            energy: parseFloat(formData.energy),
            energy_unit: formData.energy_unit
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to calculate: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center py-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Retailer Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.name}!</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Carbon Calculator Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Carbon Credit Calculator</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity ID
                </label>
                <input
                  type="text"
                  name="activity_id"
                  value={formData.activity_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: electricity-supply_grid-source_residual_mix
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Version
                </label>
                <input
                  type="text"
                  name="data_version"
                  value={formData.data_version}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Energy Value
                  </label>
                  <input
                    type="number"
                    name="energy"
                    value={formData.energy}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Energy Unit
                  </label>
                  <select
                    name="energy_unit"
                    value={formData.energy_unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kwh">kWh</option>
                    <option value="mj">MJ</option>
                    <option value="gj">GJ</option>
                    <option value="mmbtu">MMBtu</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? "Calculating..." : "Calculate Carbon Credits"}
              </button>
            </form>
            
            <div className="mt-6 text-sm text-gray-600">
              <h3 className="font-medium mb-2">API Reference:</h3>
              <p>
                This form uses the Climatiq API to calculate carbon emissions. 
                The request format follows the Climatiq estimation endpoint specifications.
              </p>
              <a 
                href="https://www.climatiq.io/docs/api-reference/estimate" 
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View API Documentation
              </a>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Calculation Results</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800">Carbon Equivalent</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-blue-600">
                      {result.co2e}
                    </span>
                    <span className="ml-2 text-lg text-blue-700">
                      {result.co2e_unit}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500">Calculation Method</h4>
                    <p className="mt-1 font-medium">{result.co2e_calculation_method}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500">Calculation Origin</h4>
                    <p className="mt-1 font-medium">{result.co2e_calculation_origin}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Emission Factor Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{result.emission_factor?.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Source:</span>
                        <p className="font-medium">{result.emission_factor?.source}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Year:</span>
                        <p className="font-medium">{result.emission_factor?.year}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Region:</span>
                      <p className="font-medium">{result.emission_factor?.region}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <p className="font-medium">{result.emission_factor?.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Constituent Gases</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium">
                      CO2e Total: {result.constituent_gases?.co2e_total} {result.co2e_unit}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No calculation yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Submit the form to calculate carbon credits
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Dashboard Summary Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Carbon Credit Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Available Credits</p>
                  <p className="text-2xl font-bold text-green-600">1,250 kg</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">This Month's Offset</p>
                  <p className="text-2xl font-bold text-blue-600">340 kg</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-md">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-800">Lifetime Offset</p>
                  <p className="text-2xl font-bold text-purple-600">12,430 kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
        <WalmartInventoryDashboard />
    </div>
    </div>

  );
}

export default RetailerDashboard;