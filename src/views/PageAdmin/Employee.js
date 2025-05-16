import { useState, useEffect } from "react";
import { X, Edit, Trash2, Plus } from "lucide-react";
import { getUsersByRole, createEmployee, updateUser, deleteUser, } from "../../api/Api";
import { getTokenFromStorage } from "../../utils/auth";

const EmployeeForm = ({ isEditing, newEmployee, handleInputChange, onSubmit, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form
                onSubmit={onSubmit}
                className="bg-white p-6 rounded-xl shadow-2xl w-[700px] relative border border-gray-200"
            >
                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
                </h3>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {/* Cột 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={newEmployee.username}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                            required
                            disabled={isEditing}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={newEmployee.email}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            name="fullname"
                            value={newEmployee.fullname}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Ngày sinh</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={newEmployee.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                        />
                    </div>

                    {/* Cột 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            value={newEmployee.phone}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">CCCD</label>
                        <input
                            type="text"
                            name="citizenId"
                            value={newEmployee.citizenId}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            value={newEmployee.address}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Vai trò</label>
                        <select
                            name="role"
                            value={newEmployee.role}
                            onChange={handleInputChange}
                            className="w-full border border-indigo-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors hover:border-indigo-400"
                        >
                            {['STAFF', 'ADMIN', 'USER'].map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-purple-600 transition-colors w-full shadow-md"
                    >
                        {isEditing ? "Cập nhật" : "Thêm"}
                    </button>
                </div>
            </form>
        </div>
    );
};


export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const [newEmployee, setNewEmployee] = useState({
        id: "",
        username: "",
        fullname: "",
        password: "12345678",
        dateOfBirth: "",
        phone: "",
        email: "",
        citizenId: "",
        address: "",
        role: "STAFF"
    });

    const token = getTokenFromStorage();

    const fetchEmployees = async () => {
        try {
            const data = await getUsersByRole("STAFF", token);
            console.log("Dữ liệu nhân viên:", data);
            setEmployees(data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({ ...newEmployee, [name]: value ?? "" });
    };

    const addEmployee = async () => {
        try {
            await createEmployee({ ...newEmployee, role: [newEmployee.role], dateOfBirth: newEmployee.dateOfBirth ? new Date(newEmployee.dateOfBirth).toISOString().split("T")[0] : null, password: "12345678" }, token);
            await fetchEmployees();
            setIsFormVisible(false);
            resetForm();
        } catch (err) {
            console.error("Lỗi khi thêm nhân viên:", err);
        }
    };

    const editEmployee = async () => {
        try {
            await updateUser(selectedEmployee.id, newEmployee, token);
            await fetchEmployees();
            setIsFormVisible(false);
            resetForm();
        } catch (err) {
            console.error("Lỗi khi cập nhật nhân viên:", err);
        }
    };

    const deleteEmployee = async (id) => {
        try {
            await deleteUser(id, token);
            await fetchEmployees();
        } catch (err) {
            console.error("Lỗi khi xóa nhân viên:", err);
        }
    };

    const resetForm = () => {
        setNewEmployee({
            id: "",
            fullname: "",
            dateOfBirth: "",
            phone: "",
            email: "",
            citizenId: "",
            role: "STAFF"
        });
        setSelectedEmployee(null);
        setIsEditing(false);
    };


    const openFormForEdit = (emp) => {
        setSelectedEmployee(emp);
        setNewEmployee({
            username: emp.username || "",
            fullname: emp.fullname || "",
            email: emp.email || "",
            phone: emp.phone || "",
            dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
            citizenId: emp.citizenId || "",
            address: emp.address || "",
            role: emp.roles?.[0] || "STAFF"
        });
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const openFormForAdd = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        isEditing ? editEmployee() : addEmployee();
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quản lý nhân viên</h2>

            <button
                onClick={openFormForAdd}
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
            >
                <Plus size={18} />
                Thêm nhân viên
            </button>

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">ID</th>
                        <th className="p-2">Tên đăng nhập</th>
                        <th className="p-2">Họ và tên</th>
                        <th className="p-2">Ngày sinh</th>
                        <th className="p-2">Vai trò</th>
                        <th className="p-2">SĐT</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">CCCD</th>
                        <th className="p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>{employees.map(emp => (
                    <tr key={emp.id} className="border-t cursor-pointer hover:bg-gray-100" onClick={() => openFormForEdit(emp)}>
                        <td className="p-2 text-center">{emp.id}</td>
                        <td className="p-2">{emp.username || "Chưa cập nhật"}</td>
                        <td className="p-2">{emp.fullname || "Chưa cập nhật"}</td>
                        <td className="p-2"> {emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</td>
                        <td className="p-2">{emp.roles?.join(", ") || "Chưa cập nhật"}</td>
                        <td className="p-2">{emp.phone || "Chưa cập nhật"}</td>
                        <td className="p-2">{emp.email || "Chưa cập nhật"}</td>
                        <td className="p-2">{emp.citizenId || "Chưa cập nhật"}</td>
                        <td className="p-2 flex gap-2 justify-center">
                            <button onClick={(e) => { e.stopPropagation(); openFormForEdit(emp); }}>
                                <Edit size={18} className="text-blue-500" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteEmployee(emp.id); }}>
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        </td>
                    </tr>
                ))}</tbody>
            </table>

            {isFormVisible && (
                <EmployeeForm
                    isEditing={isEditing}
                    newEmployee={newEmployee}
                    handleInputChange={handleInputChange}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsFormVisible(false)}
                />
            )}

        </div>
    );
}
