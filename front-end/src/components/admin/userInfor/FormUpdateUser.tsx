import type { User } from "@/types/Users";
import {
  Avatar,
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { ToastContainer } from "react-toastify";

interface FormUpdateUserProps {
  user?: User;
  errors: Record<string, string>;
  Role: string[];
  handleUpdate: () => void;
  handleBack: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const FormUpdateUser: React.FC<FormUpdateUserProps> = ({
  user,
  errors,
  Role,
  handleUpdate,
  handleBack,
  handleChange,
}) => {
  return (
    <>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          color="primary"
          sx={{ mt: 3 }}
        >
          Update User
        </Typography>

        {user && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              backgroundColor: "#fafafa",
            }}
          >
            <Avatar
              alt={user.fullName}
              src={user.avatar}
              sx={{
                width: 210,
                height: 210,
                mb: 2,
                border: "2px solid #1976d2",
              }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                width: "100%",
              }}
            >
              <TextField
                label="Full Name"
                variant="outlined"
                value={user.fullName}
                name="fullName"
                error={!!errors.fullName}
                helperText={errors.fullName}
                onChange={handleChange}
              />
              <TextField
                label="Email"
                variant="outlined"
                value={user.email}
                name="email"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Phone"
                variant="outlined"
                value={user.phone}
                name="phone"
                error={!!errors.phone}
                helperText={errors.phone}
                onChange={handleChange}
              />
              <TextField
                label="Role"
                select
                variant="outlined"
                name="role"
                value={user.role}
                onChange={handleChange}
              >
                {Role.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBack}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Quay lại
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Update
              </Button>
            </Box>
          </Box>
        )}
      </Container>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default FormUpdateUser;
