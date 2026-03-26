import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsersById } from "../../services/userService";
import type { User } from "../../types/Users";

const defaultUser = "/defaultUser.png";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  console.log(id);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUsersById(id!);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">User not found</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold text-center mb-4">User Details</h2>

      <div className="flex justify-center mb-4">
        <img
          src={user.avatar || defaultUser}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover border"
        />
      </div>

      <div className="space-y-2">
        <p>
          <strong>Full Name:</strong> {user.fullName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone || "No phone"}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Created At:</strong> {user.createdAt}
        </p>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={() => navigate(`/users/${user.id}`)}
        >
          Edit
        </button>

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}
