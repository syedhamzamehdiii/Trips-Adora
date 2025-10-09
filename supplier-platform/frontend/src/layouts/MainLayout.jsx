// Frontend/src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Footer from '@/components/common/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;