import React, { useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { loginWithGoogleRequest } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton: React.FC = () => {
    const { signIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleGoogleLogin = async (response: google.accounts.id.CredentialResponse) => {
        if (!response.credential) return;
        try {
            const data = await loginWithGoogleRequest(response.credential);
            signIn({ token: data.accessToken, user: data.user });
            console.log("Login success:", data.user);
            navigate("/");
        } catch (err: any) {
            console.error("Google login error:", err.response?.data?.message || err.message);
        }
    };

    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
                callback: handleGoogleLogin,
            });

            window.google.accounts.id.renderButton(
                document.getElementById("googleButton")!,
                { theme: "outline", size: "large", text: "signin_with" }
            );

            window.google.accounts.id.prompt();
        }
    }, []);

    return <div id="googleButton"></div>;
};

export default GoogleLoginButton;
