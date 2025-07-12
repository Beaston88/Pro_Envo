import React, { useState, useEffect } from 'react';
import supplierCarbonScore from '../Data/supplierCarbonScore.json';
import { QRCodeCanvas } from 'qrcode.react';

const SupplierBarcode = () => {
  const initialFormState = {
    companyProductName: '',
    productType: '',
    location: '',
    transport_method: '',
    carbon_score_kg: '',
    productWeight: '',
    manufacturingOrigin: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(supplierCarbonScore.map(p => p.category)));
    setCategories(uniqueCategories);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchProductByType = (productType) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = supplierCarbonScore.find(p => p.category === productType);
        resolve(product || null);
      }, 500);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowQRCode(false);
    
    // Validate form
    const newErrors = {};
    if (!formData.companyProductName.trim()) {
      newErrors.companyProductName = 'Company Product Name is required';
    }
    if (!formData.productType) {
      newErrors.productType = 'Product Type is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      const product = await fetchProductByType(formData.productType);
      if (product) {
        setFormData(prev => ({
          ...prev,
          location: product.location,
          transport_method: product.transport_method || '',
          carbon_score_kg: product.carbon_score_kg,
          manufacturingOrigin: product.manufacturing_origin || product.location || ''
        }));
      }
      setShowQRCode(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareQRCodeValue = () => {
    const details = {
      companyProductName: formData.companyProductName,
      productType: formData.productType,
      location: formData.location,
      transport_method: formData.transport_method,
      carbon_score_kg: formData.carbon_score_kg,
      productWeight: formData.productWeight,
      manufacturingOrigin: formData.manufacturingOrigin
    };
    return JSON.stringify(details);
  };

  const calculateTotalCarbon = () => {
    if (!formData.carbon_score_kg || !formData.productWeight) return 0;
    return (parseFloat(formData.carbon_score_kg) * parseFloat(formData.productWeight)).toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Carbon Footprint Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="companyProductName">
                Product Name *
              </label>
              <input
                type="text"
                id="companyProductName"
                name="companyProductName"
                value={formData.companyProductName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.companyProductName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your product name"
              />
              {errors.companyProductName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyProductName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productType">
                Product Category *
              </label>
              <select
                id="productType"
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.productType ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.productType && (
                <p className="mt-1 text-sm text-red-600">{errors.productType}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productWeight">
                Product Weight (kg)
              </label>
              <input
                type="number"
                id="productWeight"
                name="productWeight"
                value={formData.productWeight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            {formData.productType === 'Electronics' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="manufacturingOrigin">
                  Manufacturing Origin
                </label>
                <input
                  type="text"
                  id="manufacturingOrigin"
                  name="manufacturingOrigin"
                  value={formData.manufacturingOrigin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Country of manufacture"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="transport_method">
                Transport Method
              </label>
              <select
                id="transport_method"
                name="transport_method"
                value={formData.transport_method}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select transport method</option>
                <option value="bike">Bike</option>
                <option value="truck">Truck</option>
                <option value="ship">Ship</option>
                <option value="airplane">Airplane</option>
                <option value="rickshaw">Rickshaw</option>
                <option value="rail">Rail</option>
                <option value="ox-cart">Ox-cart</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                Origin Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Product origin location"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Generate Carbon Footprint'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Carbon Footprint</h3>
        
        {showQRCode ? (
          <>
            <div className="mb-6 p-4 bg-white rounded-md shadow-sm">
              <h4 className="font-medium text-gray-700 mb-2">Carbon Emissions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base CO₂ per kg:</span>
                  <span className="font-medium">{formData.carbon_score_kg || '0'} kg</span>
                </div>
                {formData.productWeight && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Weight:</span>
                      <span className="font-medium">{formData.productWeight} kg</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-medium">Total Emissions:</span>
                      <span className="font-bold text-blue-600">{calculateTotalCarbon()} kg CO₂</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center">
              <h4 className="font-medium text-gray-700 mb-3">Product QR Code</h4>
              <div className="p-4 bg-white rounded-md shadow-sm border border-gray-200">
                <QRCodeCanvas
                  value={prepareQRCodeValue()}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-3 text-sm text-gray-500 text-center">
                Scan this QR code to view the carbon footprint details
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="mt-2 text-sm font-medium text-gray-900">No carbon data yet</h4>
              <p className="mt-1 text-sm text-gray-500">
                Fill out the form and click "Generate Carbon Footprint" to calculate emissions and create a QR code.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierBarcode;