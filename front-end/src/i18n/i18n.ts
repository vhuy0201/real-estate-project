import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HOME_EN from "../locales/en/home.json";
import HOME_VI from "../locales/vi/home.json";
import PROPERTY_PAGE_EN from "../locales/en/propertyPage.json";
import PROPERTY_PAGE_VI from "../locales/vi/propertyPage.json";
import PROPERTY_DETAIl_EN from "../locales/en/propertyDetail.json";
import PROPERTY_DETAIl_VI from "../locales/vi/propertyDetail.json";
import TAXONOMIES_EN from "../locales/en/taxonomies.json";
import TAXONOMIES_VI from "../locales/vi/taxonomies.json";
import LanguageDetector from "i18next-browser-languagedetector";
import PROPERTIES_EN from "../locales/en/properties.json";
import PROPERTIES_VI from "../locales/vi/properties.json";
import PROFILE_EN from "../locales/en/profile.json";
import PROFILE_VI from "../locales/vi/profile.json";
import MY_PROPERTIES_EN from "../locales/en/myProperties.json";
import MY_PROPERTIES_VI from "../locales/vi/myProperties.json";
import BUYER_MY_PROPERTIES_EN from "../locales/en/buyerMyProperties.json";
import BUYER_MY_PROPERTIES_VI from "../locales/vi/buyerMyProperties.json";
import CREATEPROPERTYPAGE_EN from "../locales/en/createPropertyPage.json";
import CREATEPROPERTYPAGE_VI from "../locales/vi/createPropertyPage.json";
import ADDRESSAUTOCOMPLETE_EN from "../locales/en/addressAutocomplete.json";
import ADDRESSAUTOCOMPLETE_VI from "../locales/vi/addressAutocomplete.json";
import LIST_PROPERTIES_ADMIN_EN from "../locales/en/listProperties.json";
import LIST_PROPERTIES_ADMIN_VI from "../locales/vi/listProperties.json";
import DETAIL_PROPERTIES_ADMIN_EN from "../locales/en/detailProperty.json";
import DETAIL_PROPERTIES_ADMIN_VI from "../locales/vi/detailProperty.json";
import LIST_AGENTS_EN from "../locales/en/listAgents.json";
import LIST_AGENTS_VI from "../locales/vi/listAgents.json";
import AGENT_LIST_EN from "../locales/en/agentList.json";
import AGENT_LIST_VI from "../locales/vi/agentList.json";
import AGENT_DETAIL_EN from "../locales/en/agentDetail.json";
import AGENT_DETAIL_VI from "../locales/vi/agentDetail.json";
import OFFER_MANAGEMENT_EN from "../locales/en/offerManagement.json";
import OFFER_MANAGEMENT_VI from "../locales/vi/offerManagement.json";
import FAVORITE_EN from "../locales/en/favorite.json";
import FAVORITE_VI from "../locales/vi/favorite.json";
import DEAL_CONTRACT_EN from "../locales/en/dealContract.json";
import DEAL_CONTRACT_VI from "../locales/vi/dealContract.json";
import AUTH_EN from "../locales/en/auth.json";
import AUTH_VI from "../locales/vi/auth.json";
import BOOK_APPOINTMENT_EN from "@/locales/en/appointment.json";
import BOOK_APPOINTMENT_VI from "@/locales/vi/appointment.json";
import LIST_REQUEST_JOIN_EN from "../locales/en/listRequestJoin.json";
import LIST_REQUEST_JOIN_VI from "../locales/vi/listRequestJoin.json";
import ASSIGN_AGENT_EN from "@/locales/en/assignAgents.json";
import ASSIGN_AGENT_VI from "@/locales/vi/assignAgents.json";
import CONTRACT_ADMIN_EN from "../locales/en/contract.json";
import CONTRACT_ADMIN_VI from "../locales/vi/contract.json";
import DEAL_ADMIN_EN from "../locales/en/deal.json";
import DEAL_ADMIN_VI from "../locales/vi/deal.json";
import PAYMENT_ADMIN_EN from "../locales/en/payment.json";
import PAYMENT_ADMIN_VI from "../locales/vi/payment.json";
import NOTIFICATION_EN from "../locales/en/notification.json";
import NOTIFICATION_VI from "../locales/vi/notification.json";
import REVIEW_ADMIN_EN from "../locales/en/review.json";
import REVIEW_ADMIN_VI from "../locales/vi/review.json";
import COMMENT_BUYER_EN from "../locales/en/comment.json";
import COMMENT_BUYER_VI from "../locales/vi/comment.json";
import DASHBOARD_EN from "../locales/en/dashboard.json";
import DASHBOARD_VI from "../locales/vi/dashboard.json";
export const resources = {
  en: {
    home: HOME_EN,
    properties: PROPERTIES_EN, //import từ các file ở locales/en mà muốn sử dụng,
    propertyPage: PROPERTY_PAGE_EN,
    propertyDetail: PROPERTY_DETAIl_EN,
    taxonomies: TAXONOMIES_EN,
    profile: PROFILE_EN,
    myProperties: MY_PROPERTIES_EN,
    buyerMyProperties: BUYER_MY_PROPERTIES_EN,
    createPropertyPage: CREATEPROPERTYPAGE_EN,
    addressAutocomplete: ADDRESSAUTOCOMPLETE_EN,
    listProperties: LIST_PROPERTIES_ADMIN_EN,
    detailProperty: DETAIL_PROPERTIES_ADMIN_EN,
    listAgents: LIST_AGENTS_EN,
    agentList: AGENT_LIST_EN,
    agentDetail: AGENT_DETAIL_EN,
    offerManagement: OFFER_MANAGEMENT_EN,
    favorite: FAVORITE_EN,
    dealContact: DEAL_CONTRACT_EN,
    auth: AUTH_EN,
    bookAppointment: BOOK_APPOINTMENT_EN,
    assignAgent: ASSIGN_AGENT_EN,
    listRequestJoin: LIST_REQUEST_JOIN_EN,
    contract: CONTRACT_ADMIN_EN,
    deal: DEAL_ADMIN_EN,
    payment: PAYMENT_ADMIN_EN,
    notification: NOTIFICATION_EN,
    review: REVIEW_ADMIN_EN,
    comment: COMMENT_BUYER_EN,
    dashboard: DASHBOARD_EN,
  },
  vi: {
    home: HOME_VI,
    properties: PROPERTIES_VI, //import từ các file ở locales/vi mà muốn sử dụng,
    propertyPage: PROPERTY_PAGE_VI,
    propertyDetail: PROPERTY_DETAIl_VI,
    taxonomies: TAXONOMIES_VI,
    profile: PROFILE_VI,
    myProperties: MY_PROPERTIES_VI,
    buyerMyProperties: BUYER_MY_PROPERTIES_VI,
    createPropertyPage: CREATEPROPERTYPAGE_VI,
    addressAutocomplete: ADDRESSAUTOCOMPLETE_VI,
    listProperties: LIST_PROPERTIES_ADMIN_VI,
    detailProperty: DETAIL_PROPERTIES_ADMIN_VI,
    favorite: FAVORITE_VI,
    listAgents: LIST_AGENTS_VI,
    agentList: AGENT_LIST_VI,
    agentDetail: AGENT_DETAIL_VI,
    offerManagement: OFFER_MANAGEMENT_VI,
    dealContact: DEAL_CONTRACT_VI,
    auth: AUTH_VI,
    bookAppointment: BOOK_APPOINTMENT_VI,
    assignAgent: ASSIGN_AGENT_VI,
    listRequestJoin: LIST_REQUEST_JOIN_VI,
    contract: CONTRACT_ADMIN_VI,
    deal: DEAL_ADMIN_VI,
    payment: PAYMENT_ADMIN_VI,
    notification: NOTIFICATION_VI,
    review: REVIEW_ADMIN_VI,
    comment: COMMENT_BUYER_VI,
    dashboard: DASHBOARD_VI,
  },
};
export const defaultNS = "home";
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    resources,
    ns: [
      "home",
      "properties",
      "propertyPage",
      "propertyDetail",
      "profile",
      "myProperties",
      "buyerMyProperties",
      "createPropertyPage",
      "addressAutocomplete",
      "favorite",
      "offerManagement",
      "listAgents",
      "agentList",
      "agentDetail",
      "listProperties",
      "detailProperty",
      "dealContact",
      "auth",
      "contract",
      "deal",
      "payment",
      "notification",
      "review",
      "comment",
      "dashboard",
    ], //add các namespace khi viết thêm ở trên vào mảng này
    defaultNS,
    fallbackLng: "en",
    detection: {
      // 👇 cấu hình để đọc/lưu ngôn ngữ vào localStorage
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng", // key trong localStorage
    },
    interpolation: {
      escapeValue: false,
    },
  });
