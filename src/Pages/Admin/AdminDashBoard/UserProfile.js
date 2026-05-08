import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../Services/Api";
import { FaEdit } from "react-icons/fa";
import UserEdit from "./UserEdit";

function AdminUsersTable() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected User
  const [selectedUser, setSelectedUser] = useState(null);

  // LOAD USERS
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {

    try {

      const res = await apiFetch(
        "/api/v1/admin/users"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
          "Failed to load users"
        );
      }

      setUsers(data?.data || []);

    } catch (err) {

      console.error(
        "USERS ERROR:",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading Users...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-gray-800">
            All User Profiles
          </h2>

          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
            Total Users : {users.length}
          </div>

        </div>

        {/* TABLE */}
        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-gray-200 text-gray-700">

              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Address</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Edit</th>

            </tr>

          </thead>

          <tbody>

            {users.length > 0 ? (

              users.map((user) => (

                <tr
                  key={user.id}
                  className="text-center hover:bg-gray-50"
                >

                  {/* ID */}
                  <td className="p-3 border">
                    {user.id}
                  </td>

                  {/* NAME */}
                  <td className="p-3 border font-medium">
                    {user.firstname} {user.lastname}
                  </td>

                  {/* EMAIL */}
                  <td className="p-3 border">
                    {user.email}
                  </td>

                  {/* PHONE */}
                  <td className="p-3 border">
                    {user.contactno || "N/A"}
                  </td>

                  {/* ADDRESS */}
                  <td className="p-3 border">
                    {user.address || "N/A"}
                  </td>

                  {/* ROLE */}
                  <td className="p-3 border">

                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {user.role}
                    </span>

                  </td>

                  {/* EDIT */}
                  <td className="p-3 border">

                    <button
                      onClick={() => setSelectedUser(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 mx-auto"
                    >
                      <FaEdit />
                      Edit
                    </button>

                  </td>

                </tr>
              ))

            ) : (

              <tr>

                <td
                  colSpan="7"
                  className="p-6 text-center text-gray-500"
                >
                  No Users Found
                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* EDIT COMPONENT */}

      {selectedUser && (

        <UserEdit
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          reloadUsers={loadUsers}
        />

      )}

    </div>
  );
}

export default AdminUsersTable;