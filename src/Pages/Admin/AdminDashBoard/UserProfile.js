import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../Services/Api";

function UserProfile() {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // =========================================
  // LOAD USER
  // =========================================

  useEffect(() => {

    loadProfile();

  }, []);

  const loadProfile = async () => {

    try {

      const res =
        await apiFetch(
          "/api/v1/user/profile"
        );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data?.message ||
          "Failed to load profile"
        );
      }

      setUser(
        data?.data || null
      );

    } catch (err) {

      console.error(
        "PROFILE ERROR:",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-screen text-lg font-semibold">

        Loading Profile...

      </div>
    );
  }

  // =========================================
  // NO USER
  // =========================================

  if (!user) {

    return (

      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">

        User Not Found

      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-40 flex items-center justify-center">

          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-indigo-600 shadow-lg border-4 border-white">

            {user.firstname?.charAt(0)}

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-8">

          <h2 className="text-3xl font-bold text-center mb-2">

            {user.firstname} {user.lastname}

          </h2>

          <p className="text-center text-gray-500 mb-8">

            {user.role}

          </p>

          {/* DETAILS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <ProfileCard
              title="User ID"
              value={user.id}
            />

            <ProfileCard
              title="Email"
              value={user.email}
            />

            <ProfileCard
              title="Phone"
              value={user.phone || "N/A"}
            />

            <ProfileCard
              title="Department"
              value={user.department || "N/A"}
            />

            <ProfileCard
              title="Role"
              value={user.role}
            />

            <ProfileCard
              title="Status"
              value={
                user.active
                  ? "Active"
                  : "Inactive"
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================================
// PROFILE CARD
// =========================================

const ProfileCard = ({
  title,
  value,
}) => (

  <div className="bg-gray-50 p-5 rounded-xl border">

    <p className="text-sm text-gray-500 mb-1">

      {title}

    </p>

    <p className="text-lg font-semibold text-gray-800">

      {value}

    </p>

  </div>
);

export default UserProfile;