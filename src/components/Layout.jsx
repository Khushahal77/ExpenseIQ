import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      {/* Main content - offset for sidebar on desktop, topbar on mobile */}
      <main className="lg:ml-72 pt-20 lg:pt-4 px-4 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
