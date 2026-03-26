// src/utils/aiSearchHelper.ts
import OpenAI from "openai";
import { SearchCriteria } from "../types/searchCriteria";

// OpenRouter client
const openRouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});


const cache: Record<string, any> = {};

const throttle = async <T>(fn: () => Promise<T>, delay = 300): Promise<T> => {
  await new Promise(res => setTimeout(res, delay));
  return fn();
};
async function callLargeLanguageModel(
  message: string
): Promise<SearchCriteria> {
  console.log(`[AI] Phân tích câu: "${message}"`);

  // check cache
  if (cache[`intent:${message}`]) return cache[`intent:${message}`];

  const prompt = `
  Bạn là hệ thống phân tích yêu cầu tìm bất động sản. 
  Nhiệm vụ của bạn là: chỉ phân tích và trích xuất thông tin nếu câu chat của người dùng
  LIÊN QUAN đến việc:
  - mua bất động sản
  - thuê bất động sản
  - tìm bất động sản
  - hỏi về giá bất động sản
  - miêu tả loại hình bất động sản (căn hộ, chung cư, nhà, đất, biệt thự, shophouse…)

  Nếu NGỮ CẢNH KHÔNG LIÊN QUAN đến bất động sản, mua nhà, thuê nhà,
  thì phải trả về đúng JSON:
  { "ignore": true }

  Nếu liên quan, hãy trích xuất thành JSON với các field có thể có:
  - location_query: địa điểm
  - min_price: giá tối thiểu (nếu có "trên", "từ", "ít nhất")
  - max_price: giá tối đa (nếu có "dưới", "tầm", "không quá")
  - category: loại bất động sản
  - features: mảng tiện ích

  Chỉ trả về JSON thuần.

  Ví dụ hợp lệ (liên quan BĐS):
  "tìm căn hộ gần FPT dưới 5 tỷ có hồ bơi"
  --> { "location_query": "FPT Đà Nẵng", "max_price": 5000000000, "category": "căn hộ", "features": ["hồ bơi"] }

  Ví dụ không hợp lệ (không nói gì về bất động sản):
  "hôm nay trời nóng quá"
  --> { "ignore": true }

  Câu của người dùng: "${message}"
  JSON:
`;

  try {
    const response = await throttle(() =>
      openRouterClient.chat.completions.create({
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
      })
    );

    const raw = response.choices[0].message.content || "";
    const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed: SearchCriteria;

    try {
      parsed = JSON.parse(clean);
    } catch (err) {
      console.error("🔥 JSON parse fail từ AI, fallback ignore:", clean);
      return { ignore: true };
    }

    // đảm bảo nếu AI đẻ text bậy
    if (typeof parsed !== "object" || parsed === null) {
      return { ignore: true };
    }

    cache[`intent:${message}`] = parsed;
    console.log("[AI] JSON nhận được:", parsed);

    return parsed;
  } catch (err: any) {
    console.error("Lỗi gọi OpenRouter (Parse Intent):", err.message);
    return { ignore: true };
  }
}


async function callGeneratorModel(
  data: any,
  lang: "vi" | "en"
): Promise<string> {
  console.log(`[AI] Đang tạo mô tả...`);

  const cacheKey = `desc:${JSON.stringify(data)}:${lang}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const langText = lang === "vi" ? "Tiếng Việt" : "Tiếng Anh";

  const {
    title, price, category_name, type_name, bedrooms, bathrooms, area,
    address, ward_name, district_name, city_name, features_names,
    floor_number, building_block, apartment_number
  } = data;

  let details: string[] = [];
  if (title) details.push(`- Tiêu đề: ${title}`);
  if (category_name) details.push(`- Loại BĐS: ${category_name}`);
  if (type_name) details.push(`- Hình thức: ${type_name}`);
  if (price) details.push(`- Giá: ${Number(price).toLocaleString()} VND`);
  if (area) details.push(`- Diện tích: ${area} m2`);
  if (bedrooms) details.push(`- Phòng ngủ: ${bedrooms}`);
  if (bathrooms) details.push(`- Phòng tắm: ${bathrooms}`);
  const fullAddress = [address, ward_name, district_name, city_name].filter(Boolean).join(", ");
  if (fullAddress) details.push(`- Địa chỉ: ${fullAddress}`);
  if (building_block) details.push(`- Tòa nhà: ${building_block}`);
  if (floor_number) details.push(`- Tầng: ${floor_number}`);
  if (apartment_number) details.push(`- Mã căn: ${apartment_number}`);
  if (features_names && features_names.length > 0) details.push(`- Tiện ích: ${features_names.join(", ")}`);

  const prompt = `
    Bạn là một chuyên gia môi giới bất động sản hàng đầu tại Việt Nam.
    Hãy viết một mô tả (dưới 150 chữ) bất động sản thật hấp dẫn, lôi cuốn, và chuẩn SEO bằng ${langText}.
    Tuyệt đối không chỉ liệt kê thông tin, mà hãy "bán" trải nghiệm và phong cách sống.
    
    Dữ liệu bất động sản:
    ${details.join("\n")}

    Mô tả (chỉ trả về phần mô tả, không thêm tiêu đề):
  `;

  try {
    const response = await throttle(() =>
      openRouterClient.chat.completions.create({
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
      })
    );

    const result = response.choices[0].message.content || "";
    cache[cacheKey] = result.trim();
    console.log("[AI] Mô tả đã tạo:", result);

    return result.trim();
  } catch (err: any) {
    console.error("Lỗi gọi OpenRouter (Generate Description):", err.message);
    return "";
  }
}

export const aiSearchHelper = {
  async parseSearchIntent(message: string): Promise<SearchCriteria> {
    return await callLargeLanguageModel(message);
  },

  async generateDescription(data: any, lang: "vi" | "en"): Promise<string> {
    return await callGeneratorModel(data, lang);
  },
};
