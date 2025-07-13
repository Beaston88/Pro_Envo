import { useState } from "react"
import {
  Package,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Home,
  ShoppingCart,
  Truck,
  FileText,
  QrCode
} from "lucide-react"
import DemandForecastingDashboard from "./DemandForecastingDashboard.jsx"
import SupplierBarcode from "../components/SupplierBarcode.jsx"

const SupplierDashboardComponent = ({user}) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { id: "overview", label: "Dashboard Overview", icon: Home },
    { id: "demand-forecasting", label: "Demand Forecasting", icon: TrendingUp },
    { id: "inventory", label: "Carbon Score QR ", icon: QrCode },
    { id: "orders", label: "Order Management", icon: ShoppingCart },
    { id: "suppliers", label: "Supplier Network", icon: Truck },
    { id: "reports", label: "Reports & Analytics", icon: FileText },
    { id: "customers", label: "Customer Insights", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "demand-forecasting":
        return <DemandForecastingDashboard />
      case "inventory":
        return <SupplierBarcode/>
      case "overview":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{user.name} Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Sales</h3>
                <p className="text-3xl font-bold text-blue-600">$412,920</p>
                <p className="text-sm text-green-600 mt-2">+15.2% from last month</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Products Sold</h3>
                <p className="text-3xl font-bold text-green-600">8,303</p>
                <p className="text-sm text-gray-600 mt-2">Units across all categories</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active SKUs</h3>
                <p className="text-3xl font-bold text-purple-600">20</p>
                <p className="text-sm text-gray-600 mt-2">Products in catalog</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Margin</h3>
                <p className="text-3xl font-bold text-orange-600">31.2%</p>
                <p className="text-sm text-gray-600 mt-2">Across all categories</p>
              </div>
            </div>

            {/* Category Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Categories</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Electronics</span>
                    <span className="text-sm font-bold text-green-600">$218,900</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Toys & Games</span>
                    <span className="text-sm font-bold text-blue-600">$39,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Home & Garden</span>
                    <span className="text-sm font-bold text-purple-600">$36,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Clothing & Shoes</span>
                    <span className="text-sm font-bold text-orange-600">$33,420</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-red-700">PlayStation 5 Console - Critical Stock Level</span>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-yellow-700">iPhone 15 Pro - Low Stock Alert</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-green-700">Barbie Dreamhouse - High Demand Detected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("demand-forecasting")}
                  className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-blue-700 font-medium">View Demand Forecasting</span>
                </button>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Package className="w-6 h-6 text-green-600 mr-3" />
                  <span className="text-green-700 font-medium">Manage Inventory</span>
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FileText className="w-6 h-6 text-purple-600 mr-3" />
                  <span className="text-purple-700 font-medium">Generate Reports</span>
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {menuItems.find((item) => item.id === activeTab)?.label}
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">This section is under development.</p>
              <p className="text-gray-500 mt-2">Check back soon for more features!</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Walmart Supplier</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">WS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default SupplierDashboardComponent
