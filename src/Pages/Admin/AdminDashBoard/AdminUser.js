import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../Services/Api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await apiFetch("/api/v1/admin/users", {
      credentials: "include",
    });
    const data = await res.json();
    setUsers(data.data || []);
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm(user);
  };

  const handleUpdate = async () => {
    await apiFetch(`/api/v1/admin/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });

    setEditingId(null);
    loadUsers();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="text-center border-t">

              <td>{u.id}</td>

              <td>
                {editingId === u.id ? (
                  <input
                    value={form.firstname}
                    onChange={(e) =>
                      setForm({ ...form, firstname: e.target.value })
                    }
                  />
                ) : (
                  u.firstname
                )}
              </td>

              <td>{u.email}</td>

              <td>{u.role}</td>

              <td>
                {editingId === u.id ? (
                  <button onClick={handleUpdate}>Save</button>
                ) : (
                  <button onClick={() => startEdit(u)}>Edit</button>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;