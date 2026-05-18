import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import TiffinRequest from "../pages/customer/TiffinRequest";
import RequestStatus from "../pages/customer/RequestStatus";
import TodayFood from "../pages/customer/TodayFood";
import Grocery from "../pages/customer/Grocery";
import Cart from "../pages/customer/Cart";
import Orders from "../pages/customer/Orders";
import Cancellation from "../pages/customer/Cancellation";
import Payments from "../pages/customer/Payments";
import Complaints from "../pages/customer/Complaints";
import Profile from "../pages/customer/Profile";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminTiffinRequests from "../pages/admin/AdminTiffinRequests";
import AdminTodayFood from "../pages/admin/AdminTodayFood";
import AdminMealDelivery from "../pages/admin/AdminMealDelivery";
import AdminMenu from "../pages/admin/AdminMenu";
import AdminGrocery from "../pages/admin/AdminGrocery";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminDelivery from "../pages/admin/AdminDelivery";
import AdminMealCancellations from "../pages/admin/AdminMealCancellations";
import AdminPayments from "../pages/admin/AdminPayments";
import AdminCancellations from "../pages/admin/AdminCancellations";
import AdminComplaints from "../pages/admin/AdminComplaints";
import AdminCustomerHistory from "../pages/admin/AdminCustomerHistory";
import CustomerHistory from "../pages/customer/CustomerHistory";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tiffin-request"
        element={
          <ProtectedRoute role="customer">
            <TiffinRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/request-status"
        element={
          <ProtectedRoute role="customer">
            <RequestStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/today-food"
        element={
          <ProtectedRoute role="customer">
            <TodayFood />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grocery"
        element={
          <ProtectedRoute role="customer">
            <Grocery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute role="customer">
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute role="customer">
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cancellation"
        element={
          <ProtectedRoute role="customer">
            <Cancellation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute role="customer">
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints"
        element={
          <ProtectedRoute role="customer">
            <Complaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="customer">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-history"
        element={
          <ProtectedRoute role="customer">
            <CustomerHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tiffin-requests"
        element={
          <ProtectedRoute role="admin">
            <AdminTiffinRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/today-food"
        element={
          <ProtectedRoute role="admin">
            <AdminTodayFood />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/meal-delivery"
        element={
          <ProtectedRoute role="admin">
            <AdminMealDelivery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute role="admin">
            <AdminMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grocery"
        element={
          <ProtectedRoute role="admin">
            <AdminGrocery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute role="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute role="admin">
            <AdminCustomers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/delivery"
        element={
          <ProtectedRoute role="admin">
            <AdminDelivery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/meal-cancellations"
        element={
          <ProtectedRoute role="admin">
            <AdminMealCancellations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute role="admin">
            <AdminPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cancellations"
        element={
          <ProtectedRoute role="admin">
            <AdminCancellations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute role="admin">
            <AdminComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers/:id/history"
        element={
          <ProtectedRoute role="admin">
            <AdminCustomerHistory />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
