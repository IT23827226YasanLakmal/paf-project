import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchUsers, updateUserRole } from "../services/api";
import toast from "react-hot-toast";

export default function AdminUserRoles() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);

  //  Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  //  Initial load + realtime
  useEffect(() => {
    loadUsers();

    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        (payload) => {
          console.log("Realtime update:", payload);

          //  smarter update
          if (payload.eventType === "UPDATE") {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === payload.new.id ? payload.new : u
              )
            );
          } else {
            loadUsers();
          }

          toast("Live update 🔄", { icon: "⚡" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  //  Filter users
  const filteredUsers = users.filter((user) => {
    return (
      user.name?.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "" || user.role === roleFilter)
    );
  });

  //  Update role
  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);

      toast.success("Role updated successfully");

      // optional refresh (realtime will also trigger)
      loadUsers();

    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">

      <h2 className="text-2xl font-bold mb-6">Admin User Management</h2>

      {/*  SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <input
          type="text"
          placeholder="Search by name..."
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TECHNICIAN">TECHNICIAN</option>
          <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
          <option value="BOOKING_OFFICER">BOOKING_OFFICER</option>
        </select>

      </div>

      {/*  TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-lg overflow-hidden">

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
                <td colSpan="3" className="text-center p-4">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-white/10">

                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      className="w-8 h-8 rounded-full"
                      alt="avatar"
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
                      <option value="FACILITY_MANAGER">FACILITY_MANAGER</option>
                      <option value="BOOKING_OFFICER">BOOKING_OFFICER</option>
                    </select>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}