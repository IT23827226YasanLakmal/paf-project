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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-primary">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2.5">
            <Users className="w-8 h-8 text-accent animate-pulse" />
            User Access Management
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent" /> Role perspective: <span className="font-bold text-accent uppercase">Admin</span>
          </p>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-surface rounded-3xl shadow-md border border-subtle p-6 hover:border-accent/40 transition-all duration-300">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Users size={20} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-wider">Total Users</p>
          </div>
          <h2 className="text-3xl font-black text-primary">{totalUsers}</h2>
        </div>

        <div className="bg-surface rounded-3xl shadow-md border border-subtle p-6 hover:border-accent/40 transition-all duration-300">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <ShieldCheck size={20} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-wider">Admins</p>
          </div>
          <h2 className="text-3xl font-black text-primary">{admins}</h2>
        </div>

        <div className="bg-surface rounded-3xl shadow-md border border-subtle p-6 hover:border-accent/40 transition-all duration-300">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Wrench size={20} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-wider">Technicians</p>
          </div>
          <h2 className="text-3xl font-black text-primary">{technicians}</h2>
        </div>

      </div>

      {/* SIMPLE CHART SECTION */}
      <div className="bg-surface rounded-3xl shadow-md border border-subtle p-6 mb-6">

        <h3 className="text-lg font-bold text-primary mb-4">
          User Distribution
        </h3>

        <div className="space-y-4">

          <div>
            <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Admins</p>
            <div className="w-full bg-muted rounded-xl h-3 overflow-hidden">
              <div
                className="bg-accent h-3 rounded-xl transition-all duration-500"
                style={{ width: `${(admins / totalUsers) * 100 || 0}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Technicians</p>
            <div className="w-full bg-muted rounded-xl h-3 overflow-hidden">
              <div
                className="bg-green-500 h-3 rounded-xl transition-all duration-500"
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
          className="px-4 py-2.5 bg-surface border border-subtle text-primary rounded-xl w-full text-sm font-medium focus:ring-2 focus:ring-accent focus:outline-none shadow-sm placeholder:text-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2.5 bg-surface border border-subtle text-primary rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="" className="bg-surface">All Roles</option>
          <option value="USER" className="bg-surface">USER</option>
          <option value="ADMIN" className="bg-surface">ADMIN</option>
          <option value="TECHNICIAN" className="bg-surface">TECHNICIAN</option>
          <option value="BOOKING_OFFICER" className="bg-surface">BOOKING_OFFICER</option>
          <option value="FACILITY_MANAGER" className="bg-surface">FACILITY_MANAGER</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-surface rounded-3xl shadow-md border border-subtle overflow-hidden">

        <div className="p-6 border-b border-subtle flex justify-between items-center bg-surface">
          <h2 className="text-lg font-bold text-primary">
            System Users
          </h2>

          <button className="bg-accent hover:bg-accent-hover text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm border-none cursor-pointer">
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-raised">
              <tr className="text-[10px] font-bold text-muted uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-subtle">

              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center px-6 py-8 text-muted italic text-sm">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center px-6 py-8 text-muted italic text-sm">
                    No users matching criteria.
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-raised/40 transition-colors">

                  <td className="px-6 py-4 flex items-center gap-3 text-sm font-bold text-primary">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      className="w-8 h-8 rounded-full bg-raised"
                      alt="avatar"
                    />
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-xs text-secondary font-medium">{user.email}</td>

                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="bg-surface border border-subtle text-primary font-bold px-3 py-1.5 rounded-xl text-xs focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="USER" className="bg-surface">USER</option>
                      <option value="ADMIN" className="bg-surface">ADMIN</option>
                      <option value="TECHNICIAN" className="bg-surface">TECHNICIAN</option>
                      <option value="BOOKING_OFFICER" className="bg-surface">BOOKING_OFFICER</option>
                      <option value="FACILITY_MANAGER" className="bg-surface">FACILITY_MANAGER</option>
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