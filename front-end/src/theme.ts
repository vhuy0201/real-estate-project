import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    typography: {
        fontFamily: "'Inter', sans-serif",
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
        },
    },
});

export default theme;
