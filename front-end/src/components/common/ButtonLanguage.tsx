import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const ButtonLanguage = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === "en";

  const changeLanguage = (lng: "en" | "vi") => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        width: "100px",
        height: "40px",
        borderRadius: "20px",
        backgroundColor: "#F5F5F5",
        cursor: "pointer",
        overflow: "visible",
        padding: "3px",
      }}
    >
      {/* EN Text */}
      <Box
        onClick={() => changeLanguage("en")}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: isEnglish ? 700 : 500,
          color: isEnglish ? "#000000" : "rgba(0,0,0,0.4)",
          transition: "all 0.3s ease",
          zIndex: 1,
          height: "100%",
          userSelect: "none",
        }}
      >
        EN
      </Box>

      {/* Sliding Circle with Flag */}
      <Box
        sx={{
          position: "absolute",
          left: isEnglish ? "4px" : "calc(100% - 40px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "1.5px solid #E0E0E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <img
          src={isEnglish ? "/eng.png" : "/vie.png"}
          alt={isEnglish ? "English" : "Vietnamese"}
          style={{
            width: "24px",
            height: "24px",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* VI Text */}
      <Box
        onClick={() => changeLanguage("vi")}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: !isEnglish ? 700 : 500,
          color: !isEnglish ? "#000000" : "rgba(0,0,0,0.4)",
          transition: "all 0.3s ease",
          zIndex: 1,
          height: "100%",
          userSelect: "none",
        }}
      >
        VI
      </Box>
    </Box>
  );
};

export default ButtonLanguage;
