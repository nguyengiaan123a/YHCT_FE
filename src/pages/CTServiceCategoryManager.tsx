import React, { useState, useEffect } from 'react';
import apiClient from "../services/api"; // Đảm bảo đường dẫn này đúng với dự án của bạn
import { Edit3, Trash2, Search, Plus, ChevronLeft, ChevronRight, X, Upload } from 'lucide-react';
import { PATH_IMAGES } from '../types/PathImages';



const CTServiceCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 10 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Thêm 'file' vào formData để xử lý upload
  const [formData, setFormData] = useState({ title: '', status: 1, thumnail: '', file: null });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 1. Lấy danh sách Danh mục dịch vụ
const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/CTservices', {
        params: { page: pagination.currentPage, pagesize: pagination.pageSize, search: searchTerm }
      });
      
      // Lấy mảng dữ liệu
      let rawData = response.data.data;

      // Sắp xếp giảm dần theo createdDate (Mới nhất lên đầu)
      const sortedData = rawData.sort((a, b) => {
        return new Date(b.createdDate) - new Date(a.createdDate);
      });

      // Lưu vào state
      setCategories(sortedData);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPages || 1 }));
      
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  // 2. Thêm mới hoặc Cập nhật (Sử dụng FormData vì API yêu cầu multipart/form-data)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('Title', formData.title);
      submitData.append('Status', formData.status.toString());
      
      // Nếu có chọn file mới thì append vào
      if (formData.file) {
        submitData.append('file', formData.file);
      }

     if (editingId) {
      // SỬA Ở ĐÂY: Truyền id qua params để khớp với Backend (int id)
      await apiClient.put('/api/cap-nhat-danh-muc', submitData, {
        params: { id: editingId }, // Nó sẽ tạo ra link: /api/cap-nhat-danh-muc?id=1
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      // Thêm mới
      await apiClient.post('/api/them-danh-muc', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Thao tác thất bại! Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  // 3. Xóa Danh mục
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      // Tùy theo cách backend nhận tham số, có thể là query params hoặc route parameter
      await apiClient.delete(`/api/xoa-danh-muc`, { params: { id: itemToDelete } });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời để preview ảnh ngay lập tức
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, file: file, thumnail: previewUrl });
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({ 
      title: item.title, 
      status: item.status, 
      thumnail: item.thumnail || '', // URL ảnh hiện tại từ server
      file: null 
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', status: 1, thumnail: '', file: null });
  };

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-white font-sans text-gray-800">
      
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3 bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Danh mục Dịch vụ</h1>
          <p className="text-xs text-gray-500">Quản lý các loại hình dịch vụ hệ thống</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination({...pagination, currentPage: 1});
              }}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 w-16 text-center">STT</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-center w-28">Hình ảnh</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600">Tên danh mục</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600">Ngày tạo</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-center w-32">Trạng thái</th>
              <th className="px-5 py-3 font-bold text-xs uppercase text-gray-600 text-right w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-sm text-gray-400">Không tìm thấy dữ liệu</td></tr>
            ) : (
              categories.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3 text-center font-medium text-sm text-gray-500">
                    {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto border border-gray-200 overflow-hidden">
                      {item.thumnail ? (
                        <img 
                          // Lưu ý: Nếu đường dẫn thumnail là relative (VD: /Uploads/...), 
                          // có thể bạn cần nối thêm chuỗi domain của API (ví dụ: process.env.REACT_APP_API_URL + item.thumnail)
                          src={`${PATH_IMAGES}${item.thumnail}`}
                          className="w-full h-full object-cover" 
                          alt={item.title} 
                          onError={(e) => { e.target.src = 'https://api.iconify.design/lucide/image-off.svg?color=%23cbd5e1'; }}
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">No Img</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {item.id}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {formatDate(item.createdDate)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      item.status === 1 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {item.status === 1 ? 'Hoạt động' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0 text-xs">
        <span className="font-medium text-gray-500">Trang {pagination.currentPage} / {pagination.totalPages}</span>
        <div className="flex gap-1">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
            className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold uppercase text-gray-700">{editingId ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tên danh mục</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Hình đại diện (Thumbnail)</label>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full bg-gray-50 border border-gray-200 border-dashed rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Upload className="w-4 h-4" />
                        <span>Chọn file ảnh...</span>
                      </div>
                    </label>
                  </div>
                  
                  {/* Hiển thị Preview ảnh */}
                  {formData.thumnail && (
                    <div className="w-12 h-12 shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <img src={`${PATH_IMAGES}${formData.thumnail}`} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={formData.status} onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}>
                  <option value={1}>Hiện (Active)</option>
                  <option value={0}>Ẩn (Hidden)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98] mt-2 text-sm uppercase">
                Lưu dữ liệu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-xl w-full max-w-xs shadow-xl p-6 text-center border border-gray-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-1">Xác nhận xóa?</h3>
            <p className="text-xs text-gray-500 mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-xs">Hủy</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTServiceCategoryManager;