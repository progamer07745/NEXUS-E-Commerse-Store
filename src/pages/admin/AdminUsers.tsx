import { useEffect, useState } from "react";
import api from "../../services/api";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        const items = response.data.data?.docs || [];
        setUsers(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">Loading users…</div>;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <h3 className="text-xl font-semibold">Users</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-slate-800/80">
                <td className="px-3 py-3 font-medium text-white">{user.name}</td>
                <td className="px-3 py-3 text-slate-300">{user.email}</td>
                <td className="px-3 py-3 text-slate-300">{user.isAdmin ? "Admin" : user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
