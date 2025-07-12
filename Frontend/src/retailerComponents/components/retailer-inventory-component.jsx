import { useState, useMemo } from "react"
import {
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  Hash,
  Filter,
  Download,
  Bell,
  Eye,
  MoreHorizontal,
  Calendar,
  ShoppingCart,
  Users,
  Activity,
  Star,
  Zap,
  Target,
  Award,
} from "lucide-react"

// Import inventory data from external JSON file
import inventoryData from "../../data/walmart-inventory.json"

// Helper functions for date operations
const parseDate = (dateString) => new Date(dateString)
const formatDate = (date, format) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  
  if (format === 'MMM dd') {
    return `${month} ${day.toString().padStart(2, '0')}`
  } else if (format === 'MMM dd, yyyy') {
    return `${month} ${day.toString().padStart(2, '0')}, ${year}`
  }
  return date.toLocaleDateString()
}
const differenceInDays = (date1, date2) => {
  const diffTime = date1.getTime() - date2.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function WalmartInventoryDashboard() {
  const [inventory, setInventory] = useState(inventoryData)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const processedData = useMemo(() => {
    const currentDate = new Date()

    return inventory
      .map((item) => {
        const expiryDate = parseDate(item.expiryDate)
        const daysUntilExpiry = differenceInDays(expiryDate, currentDate)

        let status
        let statusColor
        let priority

        if (daysUntilExpiry < 0) {
          status = "expired"
          statusColor = "bg-red-500"
          priority = 1
        } else if (daysUntilExpiry <= 7) {
          status = "expiring-soon"
          statusColor = "bg-amber-500"
          priority = 2
        } else {
          status = "safe"
          statusColor = "bg-green-500"
          priority = 3
        }

        return {
          ...item,
          daysUntilExpiry,
          status,
          statusColor,
          priority,
          totalValue: item.quantity * item.price,
        }
      })
      .sort((a, b) => a.priority - b.priority)
  }, [inventory])

  const filteredData = useMemo(() => {
    return processedData.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [processedData, searchTerm, categoryFilter, statusFilter])

  const handleDeleteItem = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      setInventory((prev) => prev.filter((item) => item.id !== itemToDelete.id))
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "expired":
        return <XCircle className="h-4 w-4" />
      case "expiring-soon":
        return <AlertTriangle className="h-4 w-4" />
      case "safe":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusText = (item) => {
    if (item.status === "expired") {
      return `Expired ${Math.abs(item.daysUntilExpiry)} days ago`
    } else if (item.status === "expiring-soon") {
      return item.daysUntilExpiry === 0 ? "Expires today" : `${item.daysUntilExpiry} days left`
    } else {
      return `${item.daysUntilExpiry} days remaining`
    }
  }

  const stats = useMemo(() => {
    const expired = processedData.filter((item) => item.status === "expired").length
    const expiringSoon = processedData.filter((item) => item.status === "expiring-soon").length
    const safe = processedData.filter((item) => item.status === "safe").length
    const totalValue = processedData.reduce((sum, item) => sum + item.totalValue, 0)
    const expiredValue = processedData
      .filter((item) => item.status === "expired")
      .reduce((sum, item) => sum + item.totalValue, 0)
    const expiringSoonValue = processedData
      .filter((item) => item.status === "expiring-soon")
      .reduce((sum, item) => sum + item.totalValue, 0)

    return { expired, expiringSoon, safe, total: processedData.length, totalValue, expiredValue, expiringSoonValue }
  }, [processedData])

  const categories = [...new Set(inventory.map((item) => item.category))]

  const getHealthScore = () => {
    const totalItems = stats.total
    if (totalItems === 0) return 100
    const healthyItems = stats.safe
    return Math.round((healthyItems / totalItems) * 100)
  }

  const healthScore = getHealthScore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-6 md:p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Walmart Inventory Hub</h1>
                    <p className="text-blue-100 text-lg">Advanced inventory management & expiry tracking</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Live Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Health Score: {healthScore}%</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-6">
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-2">
              <Package className="h-4 w-4 mr-2 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Active inventory</div>
          </div>

          <div className="bg-red-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-2">
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              <h3 className="text-sm font-medium text-red-700">Expired</h3>
            </div>
            <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
            <div className="text-xs text-red-600">${stats.expiredValue.toLocaleString()} loss</div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
              <h3 className="text-sm font-medium text-amber-700">Expiring Soon</h3>
            </div>
            <div className="text-2xl font-bold text-amber-700">{stats.expiringSoon}</div>
            <div className="text-xs text-amber-600">${stats.expiringSoonValue.toLocaleString()} at risk</div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <h3 className="text-sm font-medium text-green-700">Safe Stock</h3>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.safe}</div>
            <div className="text-xs text-green-600">Good condition</div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-2">
              <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-700">Total Value</h3>
            </div>
            <div className="text-2xl font-bold text-blue-700">${(stats.totalValue / 1000).toFixed(0)}K</div>
            <div className="text-xs text-blue-600">Inventory worth</div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-2">
              <Award className="h-4 w-4 mr-2 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-700">Health Score</h3>
            </div>
            <div className="text-2xl font-bold text-purple-700">{healthScore}%</div>
            <div className="text-xs text-purple-600">
              {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs attention"}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Smart Inventory Control Center
            </h2>
            <p className="text-gray-600 mt-2">Real-time monitoring and management of your store inventory</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item name, SKU, supplier, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="expired">Expired Items</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="safe">Safe Items</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Product Information</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Category & Location</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Inventory Details</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Timeline</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b hover:bg-gray-50 ${
                      item.status === "expired"
                        ? "bg-red-50"
                        : item.status === "expiring-soon"
                        ? "bg-amber-50"
                        : "bg-green-50/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-lg">
                            {item.itemName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.itemName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Hash className="h-3 w-3 mr-1" />
                            {item.sku}
                          </div>
                          <div className="text-sm text-gray-600">Batch: {item.batchNumber}</div>
                          <div className="text-sm text-gray-500">{item.supplier}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {item.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.location}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-bold">{item.quantity}</span>
                          <span className="text-sm text-gray-500 ml-1">units</span>
                        </div>
                        <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                        <div className="font-bold text-green-600">${item.totalValue.toLocaleString()}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <div className="text-gray-500">Mfg: {formatDate(parseDate(item.manufacturingDate), "MMM dd")}</div>
                          <div className="font-medium">Exp: {formatDate(parseDate(item.expiryDate), "MMM dd, yyyy")}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${item.statusColor}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-2">{item.status.replace("-", " ")}</span>
                        </div>
                        <div className="text-xs text-gray-700">{getStatusText(item)}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {item.status === "expired" && (
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No items found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Remove Expired Item
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove <strong>"{itemToDelete?.itemName}"</strong> from inventory?
              </p>
              <div className="bg-red-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-red-700">
                  <strong>Financial Impact:</strong> ${itemToDelete?.totalValue.toLocaleString()} loss
                </p>
                <p className="text-sm text-red-700">
                  <strong>Quantity:</strong> {itemToDelete?.quantity} units
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remove Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}