function SupplierDashboard({ user, onLogout }) {
  return (
    <div>
      <h1>Supplier Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <button onClick={onLogout}>Logout</button>
      {/* Add supplier-specific dashboard content here */}
    </div>
  )
}

export default SupplierDashboard
