import { useEffect, useState } from "react";
import { fetchUsers, updateUserRole } from "../services/api";
import toast from "react-hot-toast";
import { Users, ShieldCheck, Wrench } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function UserManagement() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // LOAD USERS
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          loadUsers();
          toast("Live update 🔄", { icon: "⚡" });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ROLE UPDATE
  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      toast.success("Role updated");
      loadUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  // FILTER USERS
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === "" || user.role === roleFilter)
  );

  // STATS
  const totalUsers = users.length;
  const admins = users.filter(u => u.role === "ADMIN").length;
  const technicians = users.filter(u => u.role === "TECHNICIAN").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* TITLE */}
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        User Management
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Users size={18} />
            <p>Total Users</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{totalUsers}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck size={18} />
            <p>Admins</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{admins}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Wrench size={18} />
            <p>Technicians</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{technicians}</h2>
        </div>

      </div>

      {/* SIMPLE CHART SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          User Distribution
        </h3>

        <div className="space-y-4">

          <div>
            <p className="text-sm text-slate-600">Admins</p>
            <div className="w-full bg-slate-200 rounded h-2">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${(admins / totalUsers) * 100 || 0}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-600">Technicians</p>
            <div className="w-full bg-slate-200 rounded h-2">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${(technicians / totalUsers) * 100 || 0}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <input
          type="text"
          placeholder="Search user..."
          className="px-4 py-2 border rounded-lg w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-lg"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TECHNICIAN">TECHNICIAN</option>
          <option value="BOOKING_OFFICER">BOOKING_OFFICER</option>
          <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">
            System Users
          </h2>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="border-t">

                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      className="w-8 h-8 rounded-full"
                      alt="avatar"
                    />
                    {user.name}
                  </td>

                  <td className="p-3 text-slate-600">{user.email}</td>

                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border px-3 py-1 rounded-lg"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="BOOKING_OFFICER">BOOKING_OFFICER</option>
                      <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
                    </select>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}