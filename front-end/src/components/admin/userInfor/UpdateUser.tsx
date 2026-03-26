import { useEffect, useState } from "react";
import FormUpdateUser from "./FormUpdateUser";
import type { User } from "@/types/Users";
import { useNavigate, useParams } from "react-router-dom";
import { getUsersById, updateUser } from "../../../services/userService";
import { toast } from "react-toastify";
const UpdateUser = () => {
  const [user, setUser] = useState<User>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const Role = ["admin", "agent", "seller", "buyer"];
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUsersById(id!);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUser();
  }, [id]);

  const validateUpdateUser = () => {
    const newError: Record<string, string> = {};
    if (!user?.fullName?.trim()) {
      newError.fullName = "vui lòng nhập họ tên";
    }
    if (!user?.phone?.trim()) {
      newError.phone = "vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(user.phone)) {
      newError.phone = "Số điện thoại phải từ 9–11 số";
    }
    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleUpdate = async () => {
    if (!id) {
      toast.error("Không tìm thấy ID người dùng!");
      return;
    }
    if (!user) return;
    if (!validateUpdateUser()) return;

    try {
      await updateUser(id, user);
      toast.success("Cập nhật thành công!");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (error) {
      toast.error("Cập nhật thất bại!");
      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(e.target);
    setUser({ ...user!, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      <FormUpdateUser
        user={user}
        errors={errors}
        Role={Role}
        handleUpdate={handleUpdate}
        handleBack={handleBack}
        handleChange={handleChange}
      />
    </>
  );
};

export default UpdateUser;
