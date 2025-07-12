import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const QRInventoryScanner = () => {
  const [inventory, setInventory] = useState(() => {
    // Load inventory from localStorage if available
    const savedInventory = localStorage.getItem('qrInventory');
    return savedInventory ? JSON.parse(savedInventory) : [];
  });
  const [lastScanned, setLastScanned] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraId, setCameraId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'image'
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qrInventory', JSON.stringify(inventory));
  }, [inventory]);

  // Camera initialization
  useEffect(() => {
    if (isScanning && activeTab === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isScanning, cameraId, activeTab]);

  const startCameraScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const selectedCamera = devices[0].id;
        setCameraId(selectedCamera);

        const html5QrCode = new Html5Qrcode("qr-scanner-container");
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          selectedCamera,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            await processScannedCode(decodedText);
          },
          (errorMessage) => {
            if (!errorMessage.includes('NotFoundException')) {
              setError(`Scanning error: ${errorMessage}`);
            }
          }
        );
      } else {
        setError('No cameras found');
        setIsScanning(false);
      }
    } catch (err) {
      setError(`Camera error: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Please upload a JPEG, PNG, or GIF image');
      return;
    }

    if (file.size > 1048576) { // 1MB limit
      setError('Image size must be less than 1MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const scanUploadedImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        'https://api.qrserver.com/v1/read-qr-code/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data[0]?.symbol[0]?.data) {
        await processScannedCode(response.data[0].symbol[0].data);
      } else {
        setError('No QR code found in the image');
      }
    } catch (err) {
      setError('Failed to scan QR code from image');
      console.error('Image scan error:', err);
    }
  };

  const processScannedCode = async (decodedText) => {
    try {
      // First try to parse directly as JSON
      try {
        const scannedData = JSON.parse(decodedText);
        if (scannedData.companyProductName && scannedData.carbon_score_kg) {
          addToInventory(scannedData);
          return;
        }
      } catch (e) {
        // If not JSON, treat as URL and use API
      }

      // If not valid JSON, use API to decode
      const response = await axios.get(
        `https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(decodedText)}&outputformat=json`
      );

      if (response.data && response.data[0]?.symbol[0]?.data) {
        const apiData = response.data[0].symbol[0].data;
        try {
          const scannedData = JSON.parse(apiData);
          addToInventory(scannedData);
        } catch (e) {
          setError('Scanned QR data is not in expected format');
        }
      } else {
        setError('No QR code data found');
      }
    } catch (err) {
      setError('Failed to process QR code');
      console.error('Processing error:', err);
    }
  };

  const addToInventory = (scannedData) => {
    const inventoryItem = {
      ...scannedData,
      id: Date.now(),
      scannedDate: new Date().toISOString(),
      status: 'active',
      expireDate : new Date(new Date().setMonth(new Date().getMonth()+Math.floor(Math.random()*12)+1)).toDateString()
    };

    setInventory(prev => [inventoryItem, ...prev]);
    setLastScanned(inventoryItem);
    setError('');
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    setError('');
  };

  const clearInventory = () => {
    if (window.confirm('Are you sure you want to clear all inventory data?')) {
      setInventory([]);
      setLastScanned(null);
      localStorage.removeItem('qrInventory');
    }
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteItem = (id) => {
    if (window.confirm('Are you sure you want to remove this item from inventory?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
      if (lastScanned && lastScanned.id === id) {
        setLastScanned(null);
      }
    }
  };

  const exportInventory = () => {
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `inventory-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">QR Inventory Scanner</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scanner Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Combined Scanner Tabs */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'camera' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('camera')}
              >
                Camera Scanner
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'image' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('image')}
              >
                Image Scanner
              </button>
            </div>
            
            {/* Camera Scanner Content */}
            {activeTab === 'camera' && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <div id="qr-scanner-container" className="w-full h-64">
                    {!isScanning && (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                        <p>Camera scanner is inactive</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={toggleScanner}
                    className={`px-4 py-2 rounded-md ${isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {isScanning ? 'Stop Camera' : 'Start Camera'}
                  </button>
                </div>
              </>
            )}
            
            {/* Image Scanner Content */}
            {activeTab === 'image' && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-full h-64 object-contain bg-white" />
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-400">
                      <p>No image selected</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-col space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-center cursor-pointer"
                  >
                    Choose Image
                  </label>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={scanUploadedImage}
                      disabled={!selectedFile}
                      className={`flex-1 py-2 rounded-md ${
                        !selectedFile ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                    >
                      Scan Image
                    </button>
                    <button
                      onClick={resetFileInput}
                      disabled={!selectedFile}
                      className={`flex-1 py-2 rounded-md ${
                        !selectedFile ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'
                      } text-white`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Last Scanned Item */}
          {lastScanned && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium mb-3 text-blue-800">Last Scanned Product</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium">{lastScanned.companyProductName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{lastScanned.productType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Carbon Score</p>
                  <p className="font-medium">{lastScanned.carbon_score_kg} kg CO₂</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{lastScanned.location || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Transport Method</p>
                  <p className="font-medium">{lastScanned.transport_method || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Inventory Section - Now taking 2/3 of the width */}
        <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inventory ({inventory.length})</h2>
            <div className="flex space-x-2">
              <button
                onClick={exportInventory}
                disabled={inventory.length === 0}
                className={`px-3 py-1 text-sm rounded-md ${inventory.length === 0 ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                Export JSON
              </button>
              <button
                onClick={clearInventory}
                disabled={inventory.length === 0}
                className={`px-3 py-1 text-sm rounded-md ${inventory.length === 0 ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'} text-white`}
              >
                Clear All
              </button>
            </div>
          </div>
          
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="mt-2">No items in inventory yet</p>
              <p className="text-sm">Scan products to add them</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[600px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO₂ (kg)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.companyProductName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.carbon_score_kg}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.productType || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.scannedDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRInventoryScanner;