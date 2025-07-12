import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import RetailerDashboard from "./Pages/RetailerDashboard";
import SupplierDashboard from "./components/SupplierDashboard";
import SupplierBarcode from "./components/SupplierBarcode";
import Scanner from "./components/Scanner";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Retailer Routes */}
        {user.userType === "retailer" && (
          <>
            <Route
              path="/"
              element={<RetailerDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/scanner"
              element={<Scanner user={user} />}
            />
          </>
        )}

        {/* Supplier Routes */}
        {user.userType === "supplier" && (
          <>
            <Route
              path="/"
              element={<SupplierDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/supplier-barcode"
              element={<SupplierBarcode user={user} />}
            />
          </>
        )}

        {/* Catch-all route */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;