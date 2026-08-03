import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import ToastContainer from "./components/ToastContainer";

const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const CartPage = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const LoginPage = lazy(() => import("./pages/Login"));
const OrdersPage = lazy(() => import("./pages/Orders"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));

const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 text-slate-500">
    Loading…
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route
                  path="/admin/*"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                </Route>

                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Route>
              </Routes>
            </Suspense>
            <ToastContainer />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;