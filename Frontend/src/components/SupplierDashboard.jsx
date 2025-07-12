import SupplierDashboardComponent from "../supplierComponents/SupplierDashboardComponent"
function SupplierDashboard({ user, onLogout }) {
  return (
    <div>
      <button onClick={onLogout}>Logout</button>
      {/* Add supplier-specific dashboard content here */}
      <SupplierDashboardComponent/>
    </div>
  )
}

export default SupplierDashboard
