import { Outlet } from "react-router-dom";

const PrivateLayout = () => (
  <div className="min-h-screen bg-orange-50/30 text-gray-900">
    <Outlet />
  </div>
);

export default PrivateLayout;