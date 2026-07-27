import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import BookingConfirmation from "./pages/BookingConfirmation";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import HotelDetail from "./pages/HotelDetail";
import Hotels from "./pages/Hotels";
import NotFound from "./pages/NotFound";
import { Spinner } from "./components/ui";

const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminOverview = () => <AdminPages page="overview" />;
const AdminHotels = () => <AdminPages page="hotels" />;
const AdminRooms = () => <AdminPages page="rooms" />;
const AdminBookings = () => <AdminPages page="bookings" />;
const AdminStats = () => <AdminPages page="stats" />;

export default function App() {
  return <Suspense fallback={<Spinner />}><Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Home />} />
      <Route path="hotels" element={<Hotels />} />
      <Route path="hotels/:id" element={<HotelDetail />} />
      <Route path="login" element={<Auth />} />
      <Route path="register" element={<Auth register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="booking/:bookingId" element={<BookingConfirmation />} />
      </Route>
      <Route element={<ProtectedRoute admin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="hotels" element={<AdminHotels />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="stats" element={<AdminStats />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes></Suspense>;
}
