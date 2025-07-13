import SupplierDashboardComponent from "../supplierComponents/SupplierDashboardComponent"
function SupplierDashboard({ user, onLogout }) {
  return (
     <div className="min-h-screen bg-gray-50 p-4">
      <div className=" mx-auto">
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
      <SupplierDashboardComponent user={user}/>
    </div>
    </div>
  )
}

export default SupplierDashboard
