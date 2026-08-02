import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/toastContext";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const { pushToast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    const response = await api.get("/admin/users");
    const items = response.data.data?.docs ?? response.data.data ?? [];
    setUsers(Array.isArray(items) ? items : []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchUsers();
      } catch {
        pushToast("Unable to load users.", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [pushToast]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole !== "user" && newRole !== "admin") return;

    const user = users.find((u) => u._id === userId);
    if (user?.role === newRole) return;

    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((current) =>
        current.map((u) =>
          u._id === userId
            ? { ...u, role: newRole, isAdmin: newRole === "admin" }
            : u,
        ),
      );
      pushToast("User role updated.", "success");
    } catch {
      pushToast("Unable to update role. Please try again.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
        Loading users…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-900">
      <h3 className="text-xl font-semibold text-slate-900">Users</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="px-3 py-3 text-slate-600">{user.email}</td>
                <td className="px-3 py-3">
                  <select
                    value={user.role}
                    disabled={updatingId === user._id}
                    onChange={(event) =>
                      handleRoleChange(user._id, event.target.value)
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500 disabled:opacity-60"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;