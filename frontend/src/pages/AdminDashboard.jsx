import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchUsers, updateUserRole } from "../services/api";
import toast from "react-hot-toast";
import { Users, ShieldCheck, Wrench, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);

  //  LOAD USERS 
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
      .on("postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          loadUsers();
          toast("Live update 🔄", { icon: "⚡" });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  //  FILTER Users
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === "" || user.role === roleFilter)
  );

  //  ROLE UPDATE 
  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      toast.success("Role updated");
      loadUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  //  STATS 
  const totalUsers = users.length;
  const admins = users.filter(u => u.role === "ADMIN").length;
  const technicians = users.filter(u => u.role === "TECHNICIAN").length;

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR*/}
      <div className="w-64 bg-white/5 border-r border-white/10 p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">Campus Hub</h2>

        <nav className="flex flex-col gap-4 text-gray-300">
          <div className="flex items-center gap-2 text-white">
            <LayoutDashboard size={18}/> Dashboard
          </div>
          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            <Users size={18}/> Users
          </div>
          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            <ShieldCheck size={18}/> Roles
          </div>
          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            <Wrench size={18}/> System
          </div>
        </nav>
      </div>

      {/*  MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold mb-6">
          Admin Dashboard
        </h1>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <h2 className="text-2xl font-bold">{totalUsers}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Admins</p>
            <h2 className="text-2xl font-bold">{admins}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Technicians</p>
            <h2 className="text-2xl font-bold">{technicians}</h2>
          </div>

        </div>

        {/*  CHART SECTION */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">

          <h3 className="mb-4 text-lg font-semibold">User Distribution</h3>

          {/* simple visual chart */}
          <div className="space-y-3">

            <div>
              <p className="text-sm">Admins</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${(admins / totalUsers) * 100 || 0}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm">Technicians</p>
              <div className="w-full bg-gray-800 rounded h-2">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${(technicians / totalUsers) * 100 || 0}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/*  SEARCH  */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search user..."
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>
        </div>

        {/* USERS TABLE*/}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">

          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center p-4">Loading...</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-white/10">

                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      className="w-8 h-8 rounded-full"
                    />
                    {user.name}
                  </td>

                  <td className="p-3">{user.email}</td>

                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="bg-black border border-white/20 px-3 py-1 rounded"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
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