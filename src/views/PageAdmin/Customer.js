import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Eye, X } from "lucide-react";
import { getUsersByRole, createEmployee, updateUser, deleteUser } from "../../api/Api";
import { getTokenFromStorage } from "../../utils/auth";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const token = getTokenFromStorage();

    const initialFormState = {
        username: "",
        email: "",
        password: "",
        fullname: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        citizenId: "",
        role: "USER"
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchUsers = async () => {
        try {
            const data = await getUsersByRole("USER", token);
            setUsers(data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng:", error);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Guard against null fullname
    const filteredUsers = users.filter(user => {
        const name = user.fullname || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const openAddDialog = () => {
        setFormData(initialFormState);
        setSelectedUser(null);
        setAddDialogOpen(true);
    };

    const openEditDialog = user => {
        setSelectedUser(user);
        setFormData({
            username: user.username || "",
            email: user.email || "",
            password: "",
            fullname: user.fullname || "",
            phone: user.phone || "",
            address: user.address || "",
            dateOfBirth: user.dateOfBirth || "",
            citizenId: user.citizenId || "",
            role: user.roles?.[0] || "USER"
        });
        setEditDialogOpen(true);
    };

    const handleDelete = async id => {
        if (window.confirm("Bạn có chắc muốn xoá người dùng này không?")) {
            try {
                await deleteUser(id, token);
                await fetchUsers();
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
            }
        }
    };

    const handleFormChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = async e => {
        e.preventDefault();
        try {
            await createEmployee(
                { ...formData, role: [formData.role], dateOfBirth: formData.dateOfBirth },
                token
            );
            setAddDialogOpen(false);
            await fetchUsers();
        } catch (error) {
            console.error("Lỗi khi thêm người dùng:", error);
        }
    };

    const handleEditSubmit = async e => {
        e.preventDefault();
        try {
            await updateUser(selectedUser.id, { ...formData }, token);
            setEditDialogOpen(false);
            await fetchUsers();
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
        }
    };

    const closeDialogs = () => {
        setAddDialogOpen(false);
        setEditDialogOpen(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">👤 Quản lý người dùng</h2>

            <div className="flex items-center mb-4 space-x-4">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                />
                <button
                    onClick={openAddDialog}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    <Plus size={18} /> Thêm
                </button>
            </div>

            <div className="grid gap-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded shadow-sm">
                        <div>
                            <h4 className="font-semibold">{user.fullname}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditDialog(user)}
                                className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="p-2 bg-red-100 rounded hover:bg-red-200"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {(addDialogOpen || editDialogOpen) && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                    <div className="bg-white shadow-md p-6 rounded w-4/5 max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editDialogOpen ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                            </h3>
                            <button onClick={closeDialogs} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form
                            onSubmit={editDialogOpen ? handleEditSubmit : handleAddSubmit}
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                { name: "username", label: "Username", type: "text" },
                                { name: "email", label: "Email", type: "email" },
                                { name: "password", label: "Password", type: "password" },
                                { name: "fullname", label: "Họ tên", type: "text" },
                                { name: "phone", label: "SĐT", type: "text" },
                                { name: "address", label: "Địa chỉ", type: "text" },
                                { name: "dateOfBirth", label: "Ngày sinh", type: "date" },
                                { name: "citizenId", label: "CCCD", type: "text" }
                            ].map(field => (
                                <div key={field.name} className="flex flex-col">
                                    <label htmlFor={field.name} className="font-medium">
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type={field.type}
                                        value={formData[field.name] || ""}
                                        onChange={handleFormChange}
                                        required
                                        className="border rounded px-3 py-2"
                                    />
                                </div>
                            ))}

                            <div className="col-span-2 flex justify-end gap-4 mt-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    {editDialogOpen ? "Lưu thay đổi" : "Thêm"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeDialogs}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
