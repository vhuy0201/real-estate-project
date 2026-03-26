import { useRoutes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot/ChatBot";
import { LoginRoute } from "./routes/LoginRoute";
import { AdminRoute } from "./routes/AdminRoute";
import { SellerRoute } from "./routes/SellerRoute";
import { BuyerRoute } from "./routes/BuyerRoute";
import { AgentRoute } from "./routes/AgentRoute";
import { Bounce, ToastContainer } from "react-toastify";
import theme from "./theme";
import './i18n/i18n';


function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const allRoutes = [
    ...LoginRoute,
    ...BuyerRoute,
    ...AdminRoute,
    ...SellerRoute,
    ...AgentRoute,

  ];

  const routing = useRoutes(allRoutes);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {!isAdmin && <Navbar />}
        {routing}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
        {!isAdmin && <ChatBot />}
      </AuthProvider>
    </ThemeProvider>




  )
}

export default App;
