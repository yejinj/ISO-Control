import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 사용자 타입 정의
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'member'; // 예시 역할
  createdAt: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
}

const API_URL = "http://localhost:8000"; // 실제 백엔드 URL로 변경 필요

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<User[]>(`${API_URL}/users`);
        setUsers(response.data);
      } catch (err) {
        setError("사용자 목록을 불러오는 데 실패했습니다.");
        console.error(err);
        // 데모용 임시 데이터 (API 실패 시)
        setUsers([
          { id: 'usr-001', username: 'admin_user', email: 'admin@example.com', role: 'admin', createdAt: '2024-04-20T10:00:00Z' },
          { id: 'usr-002', username: 'member_user', email: 'member@example.com', role: 'member', createdAt: '2024-04-21T11:30:00Z' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // 필요하다면 주기적으로 사용자 목록 갱신
    // const intervalId = setInterval(fetchUsers, 30000); // 예: 30초마다
    // return () => clearInterval(intervalId);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError(null);
      await axios.post(`${API_URL}/users`, formData);
      await fetchUsers();
      setIsAddModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'member'
      });
    } catch (err) {
      setFormError("사용자 추가에 실패했습니다.");
      console.error(err);
      // 데모용: 실제 API 없이 UI 업데이트
      const newUser: User = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      setIsAddModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'member'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    try {
      await axios.delete(`${API_URL}/users/${selectedUserId}`);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      // 데모용: 실제 API 없이 UI 업데이트
      setUsers(prev => prev.filter(user => user.id !== selectedUserId));
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('ko-KR');
    } catch {
      return timestamp;
    }
  };

  // 로딩 상태 표시
  if (loading) {
    return <div className="p-6 text-center">사용자 목록 로딩 중...</div>;
  }

  // 오류 상태 표시
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">사용자 관리</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          새 사용자 추가
        </button>
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자명</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimestamp(user.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">등록된 사용자가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 사용자 추가 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">새 사용자 추가</h3>
            {formError && (
              <div className="mb-4 text-sm text-red-600">{formError}</div>
            )}
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">사용자명</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">역할</label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  >
                    <option value="member">일반 사용자</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">사용자 삭제</h3>
            <p className="text-sm text-gray-500 mb-4">
              정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                취소
              </button>
              <button
                onClick={handleDeleteUser}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 