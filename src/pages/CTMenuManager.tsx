import React, { useState, useEffect } from 'react';
import apiClient from "../services/api";
import { Edit3, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

const CTMenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 15 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', order: 0, status: 1, thumnail: '' });

  // State cho Popup xác nhận Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/danh-sach-danh-muc-menu', {
        params: { page: pagination.currentPage, pagesize: pagination.pageSize, search: searchTerm }
      });
      setMenus(response.data.data);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPages }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await apiClient.put(`/api/cap-nhat-menu/${editingId}`, formData);
      else await apiClient.post('/api/them-danh-muc-menu', formData);
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert("Thao tác thất bại!");
    }
  };

  // Mở popup xác nhận xóa thay vì dùng window.confirm
  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Hàm thực thi xóa khi ấn nút trong Popup
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/api/xoa-danh-muc-menu/${itemToDelete}`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({ title: item.title, order: item.order, status: item.status, thumnail: item.thumnail || '' });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', order: 0, status: 1, thumnail: '' });
  };

  return (
    // Thêm font-[Arial] và text-black cho toàn bộ component
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-white font-[Arial] text-black">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white shrink-0">
        <div className="hidden sm:block">
          <h1 className="text-2xl font-extrabold tracking-tight">Danh mục Menu</h1>
          <p className="text-base mt-1">Điều hướng hệ thống</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
            <input 
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-base outline-none text-black font-bold placeholder-black"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold shadow-md shadow-blue-200 flex items-center gap-2 transition-all active:scale-95 text-lg whitespace-nowrap"
          >
            <Plus className="w-6 h-6" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="flex-1 overflow-auto bg-white scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm border-b border-gray-300">
            <tr>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider w-24">Thứ tự</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-center w-24">Icon</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Thông tin danh mục</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-center w-48">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-right w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-20"><div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></td></tr>
            ) : menus.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-20 font-bold text-lg italic">--- Không có dữ liệu ---</td></tr>
            ) : (
              menus.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-bold text-lg">{item.order}</span>
                  </td>
                  
                  {/* Cột Icon */}
                  <td className="px-6 py-5 text-center">
                    {item.thumnail ? (
                      <img 
                        src={item.thumnail} 
                        alt="icon" 
                        className="w-10 h-10 object-contain mx-auto rounded drop-shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=X'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded mx-auto flex items-center justify-center text-black">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="font-bold text-lg">{item.title}</div>
                    <div className="text-sm mt-1">UID: {item.id}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${
                      item.status === 1 ? 'bg-green-100 text-black border border-green-300' : 'bg-red-100 text-black border border-red-300'
                    }`}>
                      {item.status === 1 ? 'Hoạt động' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-3">
                      <button onClick={() => openEdit(item)} className="p-3 text-black hover:text-blue-600 bg-gray-100 hover:bg-blue-100 rounded-lg transition-all"><Edit3 className="w-6 h-6" /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-3 text-black hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-lg transition-all"><Trash2 className="w-6 h-6" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
        <p className="text-base font-bold uppercase tracking-widest">Trang {pagination.currentPage} / {pagination.totalPages}</p>
        <div className="flex gap-2">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
            className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-200 disabled:opacity-30 transition-all text-black"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
            className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-200 disabled:opacity-30 transition-all text-black"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* =========================================
          MODAL THÊM / SỬA MENU 
      ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-[999] font-[Arial] text-black">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-gray-300">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-100">
              <h3 className="text-xl font-black uppercase tracking-tight">{editingId ? 'Sửa Menu' : 'Thêm Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-black hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-black uppercase mb-2">Tên danh mục</label>
                <input required type="text" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all text-black font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Link Icon (CDN/URL)</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="url" 
                    placeholder="https://cdn.example.com/icon.png"
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all text-black font-bold" 
                    value={formData.thumnail} 
                    onChange={(e) => setFormData({...formData, thumnail: e.target.value})} 
                  />
                  {formData.thumnail && (
                    <div className="w-14 h-14 shrink-0 bg-gray-100 border border-gray-300 rounded-lg p-2 flex justify-center items-center">
                      <img src={formData.thumnail} alt="preview" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Thứ tự</label>
                  <input type="number" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all text-black font-bold" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase mb-2">Trạng thái</label>
                  <select className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all font-bold text-black" value={formData.status} onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}>
                    <option value={1}>Hiện (Active)</option>
                    <option value={0}>Ẩn (Hidden)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-4 uppercase text-lg tracking-widest">
                Lưu Thay Đổi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL XÁC NHẬN XÓA (MỚI)
      ========================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-[1000] font-[Arial] text-black">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-gray-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-50">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase">Cảnh báo Xóa</h3>
              <p className="text-lg mb-8 font-bold text-gray-800">Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-black py-3 rounded-xl transition-all text-lg"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 text-lg"
                >
                  Xóa Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CTMenuManager;