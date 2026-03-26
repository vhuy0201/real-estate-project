import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "vi",
    preload: ["vi", "en"],
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}/translation.json"),
    },
    detection: {
      // FE có thể gửi ngôn ngữ bằng ?lang=en hoặc header Accept-Language
      order: ["querystring", "header"],
      lookupQuerystring: "lang",
    },
    debug: false,
  });

export default middleware.handle(i18next);
