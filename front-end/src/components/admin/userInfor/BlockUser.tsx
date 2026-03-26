import {
  blockUserAndUnBlock,
  getUsersById,
} from "../../../services/userService";
import type { User } from "@/types/Users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
type BlockUserProps = {
  userId: string;
};
const BlockUser = ({ userId }: BlockUserProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User>();

  const handleOpen = async () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUsersById(userId!);
        setUser(data);
      } catch (error) {
        toast.error("Không thể lấy dữ liệu người dùng.");
        console.error("Error fetching user data", error);
      }
    };
    fetchUser();
  }, [userId]);

  const handleBlockAndUnBlockUser = async () => {
    if (!userId) {
      toast.error("Không tìm thấy ID người dùng!");
      return;
    }
    if (!user) return;

    try {
      const updatedStatus = await blockUserAndUnBlock(userId, user);
      setUser(updatedStatus);
      if (updatedStatus.isActive) {
        toast.success("Unblock thành công!");
      } else {
        toast.success("Block thành công!");
      }
      setOpen(false);
    } catch (error) {
      toast.error(user.isActive ? "Block thất bại!" : "Unblock thất bại!");
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <span className="text-gray-500 animate-pulse text-lg">
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  return (
    <>
      {user && (
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={handleOpen}
          sx={{
            fontSize: "0.75rem",
            borderRadius: "4px",
            minWidth: "auto",
            height: "24px",
          }}
        >
          {user.isActive ? (
            <FontAwesomeIcon icon={faLockOpen} />
          ) : (
            <FontAwesomeIcon icon={faLock} />
          )}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        {user && (
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar
                alt={user.fullName}
                src={user.avatar}
                sx={{
                  width: 140,
                  height: 140,
                  border: "3px solid #1976d2",
                  mb: 2,
                }}
              />
            </Box>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table
                sx={{
                  minWidth: 300,
                  width: "100%",
                  "@media (max-width:600px)": {
                    "& td, & th": {
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                    },
                    "& tr": {
                      display: "block",
                      marginBottom: "12px",
                      borderBottom: "1px solid #eee",
                    },
                    "& td:first-of-type": {
                      fontWeight: 600,
                      color: "text.secondary",
                      pb: 0.5,
                    },
                    "& td:last-of-type": {
                      pb: 1,
                    },
                  },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Full Name</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Phone</TableCell>
                    <TableCell>{user.phone}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Role</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </DialogContent>
        )}

        <DialogTitle
          sx={{
            mt: -1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "error.main",
            fontWeight: 600,
          }}
        >
          {user?.isActive
            ? "Do you want to block this account?"
            : "Do you want to unblock this account?"}
        </DialogTitle>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBlockAndUnBlockUser}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: 2 }}
            autoFocus
          >
            {user?.isActive ? "Block" : "unBlock"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BlockUser;
