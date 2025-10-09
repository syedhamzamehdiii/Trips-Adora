// Frontend/src/layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;