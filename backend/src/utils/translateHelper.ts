import { translate } from "@vitalets/google-translate-api";

const CACHE = new Map<string, string>();

/**
 * Detect language của text (vi hoặc en)
 * Sử dụng regex để detect ký tự tiếng Việt
 */
export function detectLanguage(text: string): "vi" | "en" {
  if (!text || text.trim().length === 0) return "vi"; // default

  // Regex để detect ký tự tiếng Việt: ă, â, ê, ô, ơ, ư, đ và các dấu thanh
  const vietnamesePattern = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđăâêôơưđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐĂÂÊÔƠƯĐ]/;

  // Nếu có ký tự tiếng Việt -> vi, ngược lại -> en
  return vietnamesePattern.test(text) ? "vi" : "en";
}

/**
 * Translate text sang ngôn ngữ khác
 */
export async function translateText(text: string, targetLang: "en" | "vi"): Promise<string> {
  if (!text) return "";

  const cacheKey = `${text}-${targetLang}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey)!;

  try {
    const res = await translate(text, { to: targetLang });
    const translated = (res as any)?.text || text;
    CACHE.set(cacheKey, translated);
    return translated;
  } catch (err) {
    console.error("Translation failed:", err);
    return text; // fallback
  }
}

/**
 * Tạo object đa ngôn ngữ từ text input
 * Tự động detect ngôn ngữ và dịch sang ngôn ngữ còn lại
 */
export async function createMultilangText(text: string): Promise<{ vi: string; en: string }> {
  if (!text || text.trim().length === 0) {
    return { vi: "", en: "" };
  }

  const detectedLang = detectLanguage(text);
  const sourceText = text.trim();

  if (detectedLang === "vi") {
    // Nếu là tiếng Việt, dịch sang tiếng Anh
    const translated = await translateText(sourceText, "en");
    return {
      vi: sourceText,
      en: translated,
    };
  } else {
    // Nếu là tiếng Anh, dịch sang tiếng Việt
    const translated = await translateText(sourceText, "vi");
    return {
      vi: translated,
      en: sourceText,
    };
  }
}
