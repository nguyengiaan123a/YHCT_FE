// routes/Index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Index from '../pages/Index';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import CTMenuManager from '../pages/CTMenuManager';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />, // Đây chính là Dashboard dùng chung
    children: [
      {
        index: true, // Vào "/" tự động vào đây
        element: <Navigate to="/trang-chu" replace />,
      },
      {
        path: 'trang-chu',
        element: <Index />, // Nội dung Index.tsx sẽ hiện ở Outlet
      },
      {
        path: 'quan-ly-danh-muc-menu',
        element: <CTMenuManager />, // Nội dung Menu sẽ hiện ở Outlet
      },
    ],
  },
  {
    path: '*',
    element: <div className="p-10 text-center">404 - Không tìm thấy trang</div>,
  },
]);