import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Target,
  Search,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChartIcon,
  Activity,
} from "lucide-react"

// Import your sales data
import salesData from "../data/sales-data.json"

const DemandForecastingDashboard = () => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTrend, setSelectedTrend] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("overview")
  const [chartType, setChartType] = useState("bar")

  useEffect(() => {
    setItems(salesData.salesData)
    setFilteredItems(salesData.salesData)
  }, [])

  useEffect(() => {
    let filtered = items

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedTrend !== "all") {
      filtered = filtered.filter((item) => item.trend === selectedTrend)
    }

    if (searchTerm) {
      filtered = filtered.filter((item) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredItems(filtered)
  }, [items, selectedCategory, selectedTrend, searchTerm])

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />
    }
  }

  const getDemandColor = (score) => {
    if (score >= 85) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getDemandLabel = (score) => {
    if (score >= 85) return "High Demand"
    if (score >= 70) return "Medium Demand"
    return "Low Demand"
  }

  // Prepare data for different chart types
  const demandScoreData = filteredItems.map((item) => ({
    name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + "..." : item.itemName,
    score: item.demandScore,
    units: item.unitsSold,
    revenue: item.revenue,
    margin: item.margin,
  }))

  const categoryData = salesData.categories.map((cat) => ({
    name: cat.name,
    revenue: cat.totalRevenue,
    units: cat.totalUnits,
    avgScore: cat.avgDemandScore,
    fill: cat.color,
  }))

  const trendData = [
    {
      name: "Increasing",
      count: items.filter((i) => i.trend === "increasing").length,
      color: "#10B981",
    },
    {
      name: "Stable",
      count: items.filter((i) => i.trend === "stable").length,
      color: "#F59E0B",
    },
    {
      name: "Decreasing",
      count: items.filter((i) => i.trend === "decreasing").length,
      color: "#EF4444",
    },
  ]

  const radarData = filteredItems.slice(0, 6).map((item) => ({
    item: item.itemName.substring(0, 10),
    demand: item.demandScore,
    revenue: item.revenue / 1000,
    units: item.unitsSold / 10,
    growth: Math.max(0, item.monthlyGrowth + 20),
    margin: item.margin,
  }))

  const scatterData = filteredItems.map((item) => ({
    x: item.unitsSold,
    y: item.revenue,
    z: item.demandScore,
    name: item.itemName,
  }))

  const weeklyTrendData = [
    { day: "Mon", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[0], 0) },
    { day: "Tue", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[1], 0) },
    { day: "Wed", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[2], 0) },
    { day: "Thu", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[3], 0) },
    { day: "Fri", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[4], 0) },
    { day: "Sat", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[5], 0) },
    { day: "Sun", sales: filteredItems.reduce((sum, item) => sum + item.weeklyData[6], 0) },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"]

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={demandScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, revenue }) => `${name}: $${(revenue / 1000).toFixed(0)}K`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )
      case "composed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={demandScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="units" fill="#8884d8" />
              <Line yAxisId="right" type="monotone" dataKey="score" stroke="#ff7300" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Walmart Demand Forecasting Dashboard</h1>
              <p className="text-gray-600">
                Analyze product demand trends across all store categories and make data-driven inventory decisions
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {salesData.categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
            >
              <option value="all">All Trends</option>
              <option value="increasing">Increasing</option>
              <option value="stable">Stable</option>
              <option value="decreasing">Decreasing</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="predictions">Predictions</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Line Chart</option>
              <option value="composed">Combined Chart</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${filteredItems.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +
                  {(
                    filteredItems.reduce((sum, item) => sum + item.monthlyGrowth, 0) / filteredItems.length || 0
                  ).toFixed(1)}
                  % avg growth
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Units Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredItems.reduce((sum, item) => sum + item.unitsSold, 0).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">{filteredItems.length} products tracked</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Demand Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    filteredItems.reduce((sum, item) => sum + item.demandScore, 0) / filteredItems.length || 0,
                  )}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {filteredItems.filter((item) => item.demandScore >= 85).length} high demand items
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredItems.filter((item) => item.stockLevel <= item.reorderPoint).length}
                </p>
                <p className="text-sm text-red-600 mt-1">Require immediate attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {chartType === "bar" && "Demand Scores by Product"}
              {chartType === "pie" && "Revenue Distribution by Category"}
              {chartType === "line" && "Weekly Sales Trend"}
              {chartType === "composed" && "Units Sold vs Demand Score"}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded ${chartType === "bar" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`p-2 rounded ${chartType === "pie" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
              >
                <PieChartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-2 rounded ${chartType === "line" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={() => setChartType("composed")}
                className={`p-2 rounded ${chartType === "composed" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
          {renderChart()}
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue vs Units Scatter Plot */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Units Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid />
                <XAxis dataKey="x" name="Units Sold" />
                <YAxis dataKey="y" name="Revenue" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter dataKey="y" fill="#82ca9d" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Trend Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trendData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-dimensional Radar */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="item" />
                <PolarRadiusAxis />
                <Radar name="Demand" dataKey="demand" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Margin %" dataKey="margin" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Inventory Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-sm text-gray-500">{item.subcategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.unitsSold.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getDemandColor(item.demandScore)}`}></div>
                        <span className="text-sm text-gray-900">{item.demandScore}</span>
                        <span className="ml-2 text-xs text-gray-500">({getDemandLabel(item.demandScore)})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTrendIcon(item.trend)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{item.trend}</span>
                        <span className="ml-1 text-xs text-gray-500">
                          ({item.monthlyGrowth > 0 ? "+" : ""}
                          {item.monthlyGrowth}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.stockLevel <= item.reorderPoint ? (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Low Stock ({item.stockLevel})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-green-600">In Stock ({item.stockLevel})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salesData.insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
              <ul className="space-y-2">
                {insight.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-sm">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        insight.type === "high_demand"
                          ? "bg-green-500"
                          : insight.type === "reorder_alert"
                            ? "bg-yellow-500"
                            : insight.type === "seasonal_opportunity"
                              ? "bg-purple-500"
                              : "bg-red-500"
                      }`}
                    ></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemandForecastingDashboard
