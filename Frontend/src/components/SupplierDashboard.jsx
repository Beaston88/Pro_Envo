import { Link } from 'react-router-dom';

function SupplierDashboard({ user, onLogout }) {
  return (
    <div>
      <h1>Supplier Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <button onClick={onLogout}>Logout</button>
      {/* Add supplier-specific dashboard content here */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/supplier-barcode">
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Supplier Barcode
          </button>
        </Link>
      </div>
    </div>
  )
}

export default SupplierDashboard
