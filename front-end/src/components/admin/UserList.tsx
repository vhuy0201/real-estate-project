import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../services/userService";
import type { User } from "../../types/Users";
import BlockUser from "./userInfor/BlockUser";
import { ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench, faEye } from "@fortawesome/free-solid-svg-icons";
const defaultUser = "/defaultUser.png";

const columns = (navigate: any) => [
  {
    field: "avatar",
    headerName: "Avatar",
    width: 80,
    renderCell: (params: any) => (
      <img
        src={params.value || defaultUser}
        alt="avatar"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    ),
  },
  { field: "fullName", headerName: "Full Name", width: 200 },
  { field: "email", headerName: "Email", width: 240 },
  { field: "role", headerName: "Role", width: 140 },
  {
    field: "action",
    headerName: "Action",
    width: 210,
    renderCell: (param: any) => (
      <div className=" w-full h-full flex justify-center items-center space-x-2 ">
        <button title="button"
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-pointer"
          onClick={() => navigate(`${param.row.id}`)}
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
        <button title="button"
          className="bg-red-500 text-white px-2 py-1 rounded text-xs cursor-pointer"
          onClick={() => navigate(`edit/${param.row.id}`)}
        >
          <FontAwesomeIcon icon={faWrench} />
        </button>
        <BlockUser userId={param.row.id} />
      </div>
    ),
  },
];
const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRows, setFilterRows] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await getAllUsers();

        if (role) {
          setRows(users.filter((u) => u.role === role));
        } else {
          setRows(users);
        }
      } catch (error) {
        console.error("Cannot fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  useEffect(() => {
    const filtered = rows.filter(
      (row) =>
        row.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.email.toLowerCase().includes(searchText.toLowerCase()) ||
        row.role.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilterRows(filtered);
  }, [searchText, rows]);

  return (
    <Paper sx={{ height: 500, width: "100%", p: 2 }}>
      <h2 className="text-center pb-4 text-lg font-bold">User Management</h2>
      <div className="pb-4 ">
        <input
          type="text"
          placeholder="Search by name or email or role..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded px-3 py-1 w-1/3"
        />
      </div>
      <DataGrid
        rows={filterRows}
        columns={columns(navigate)}
        loading={loading}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        sx={{ border: 0 }}
      />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Paper>
  );
}
