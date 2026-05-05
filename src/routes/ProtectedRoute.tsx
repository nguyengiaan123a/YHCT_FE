import { useEffect, useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import apiClient from "../services/api";
import Loading from "../Component/Loading";

const ProtectedRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const location = useLocation(); // Lấy đường dẫn hiện tại để làm nổi bật Menu

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiClient.get("/api/user");
        setUserName(res.data.username || "Admin");
        setIsAuth(true);
      } catch (err: any) {
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/logout");
      window.location.href = "/login";
    } catch (error) {
      window.location.href = "/login";
    }
  };

  // 1. Loading khi đang check auth
  if (isAuth === null) {
    return <Loading />;
  }

  // 2. Chặn nếu chưa login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // 3. Render DASHBOARD DÙNG CHUNG nếu đã login thành công
  // Hàm check active link
  const activeClass = (path: string) => 
    location.pathname === path 
      ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
      : "text-slate-600 hover:bg-slate-100 hover:text-blue-600";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      
      {/* --- SIDEBAR CỐ ĐỊNH --- */}
      <aside className="w-64 bg-white shadow-xl fixed h-full z-20 flex flex-col">
        <div className="p-6">
          <div className="bg-blue-600 rounded-xl p-3 flex items-center justify-center gap-2 shadow-lg">
            <span className="text-2xl">🏥</span>
            <span className="font-bold text-white text-lg tracking-tight">YHCT ADMIN</span>
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-2 px-4 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-4 mb-2 tracking-widest">Main Menu</p>
          
          <Link to="/trang-chu" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeClass('/trang-chu')}`}>
            <span className="text-xl">📊</span> 
            <span>Dashboard</span>
          </Link>

          <Link to="/quan-ly-danh-muc-menu" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeClass('/quan-ly-danh-muc-menu')}`}>
            <span className="text-xl">🛠️</span> 
            <span>Quản lý Menu</span>
          </Link>

          {/* Bạn có thể thêm các mục khác như Bệnh nhân, Lịch khám ở đây */}
          <Link to="/benh-nhan" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeClass('/benh-nhan')}`}>
            <span className="text-xl">👥</span> 
            <span>Bệnh nhân</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-medium"
          >
            <span className="text-xl">🚪</span> 
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- NỘI DUNG CHÍNH (MAIN) --- */}
    <div className="flex-1 ml-64 flex flex-col min-h-screen">
  
  {/* Navbar - Giữ nguyên nhưng đảm bảo không có z-index quá cao gây xung đột */}
  <header className="h-20 flex items-center justify-between bg-white/80 backdrop-blur-md px-8 border-b border-slate-100 shrink-0">
    <div className="flex flex-col">
      <h1 className="text-slate-800 font-bold text-lg">
        {location.pathname === '/trang-chu' ? 'Tổng quan hệ thống' : 'Quản lý danh mục'}
      </h1>
      <p className="text-xs text-slate-400">Chào mừng trở lại, {userName}!</p>
    </div>

    <div className="flex items-center gap-4">
      <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-slate-700 font-semibold text-sm">{userName}</span>
      </div>
    </div>
  </header>

  {/* Main Content - Thêm flex-1 và overflow-auto để cuộn nội bộ nếu cần */}
  <main className="flex-1 p-4 md:p-8 w-full overflow-y-auto"> 
    <Outlet />
  </main>
</div>
    </div>
  );
};

export default ProtectedRoute;