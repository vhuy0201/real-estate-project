import { notificationService, CreateNotificationParams } from "../services/notification.service";
import { NotificationType } from "../models/notification.model";
import { emitNotification } from "../socket/socket";
import { DealStatus } from "../models/deal.model";
import { formatVND } from "./formatMoney";


export async function createNotification(
  userId: string,
  title: string,
  message: string,
  options?: {
    type?: NotificationType;
    relatedId?: string;
    actionUrl?: string;
    meta?: Record<string, any>;
  }
) {
  try {
    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type: options?.type || "system",
      relatedId: options?.relatedId,
      actionUrl: options?.actionUrl,
      meta: options?.meta,
    });

    if (notification) {
      emitNotification(userId, notification);
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}


// Notification khi seller gửi yêu cầu gán agent
export async function notifyAssignmentRequest(
  agentId: string,
  sellerName: string,
  propertyTitle: string,
  assignmentId: string
) {
  return createNotification(
    agentId,
    "Yêu cầu quản lý property mới",
    `${sellerName} đã gửi cho bạn yêu cầu quản lý cho property "${propertyTitle}"`,
    {
      type: "property",
      relatedId: assignmentId,
      actionUrl: `/notifications/agent/assignments`, // (URL ví dụ, bạn đổi thành URL agent xem request)
    }
  );
}

// Notification khi agent chấp nhận yêu cầu
export async function notifyAssignmentAccepted(
  sellerId: string,
  agentName: string,
  propertyTitle: string,
  assignmentId: string
) {
  return createNotification(
    sellerId,
    "Yêu cầu quản lý đã được chấp nhận",
    `${agentName} đã chấp nhận yêu cầu quản lý cho property "${propertyTitle}"`,
    {
      type: "property",
      relatedId: assignmentId,
      actionUrl: `/notifications/seller/properties/${assignmentId}`, // (URL ví dụ)
    }
  );
}

// Notification khi agent từ chối yêu cầu
export async function notifyAssignmentRejected(
  sellerId: string,
  agentName: string,
  propertyTitle: string,
  assignmentId: string,
  reason?: string
) {
  const message = `${agentName} đã từ chối yêu cầu quản lý cho property "${propertyTitle}"${reason ? `: ${reason}` : ""
    }`;
  return createNotification(sellerId, "Yêu cầu quản lý bị từ chối", message, {
    type: "property",
    relatedId: assignmentId,
    actionUrl: `/notifications/seller/properties/${assignmentId}`, // (URL ví dụ)
  });
}

// Notification khi seller hủy yêu cầu (khi đang pending)
export async function notifyAssignmentCancelled(
  agentId: string,
  sellerName: string,
  propertyTitle: string,
  assignmentId: string
) {
  return createNotification(
    agentId,
    "Yêu cầu quản lý đã bị hủy",
    `${sellerName} đã hủy yêu cầu quản lý cho property "${propertyTitle}"`,
    {
      type: "property",
      relatedId: assignmentId,
      actionUrl: `/notifications/agent/assignments`, // (URL ví dụ)
    }
  );
}

export async function notifyAssignmentCancelledByAgent(
  sellerId: string,
  agentName: string,
  propertyTitle: string,
  assignmentId: string
) {
  return createNotification(
    sellerId,
    "Agent đã hủy yêu cầu quản lý",
    `${agentName} đã hủy yêu cầu quản lý property "${propertyTitle}"`,
    {
      type: "property",
      relatedId: assignmentId,
      actionUrl: `/seller/assignments`, // trang seller xem danh sách
    }
  );
}


// Notification khi seller gỡ agent khỏi property
export async function notifyAgentRemoved(
  agentId: string,
  sellerName: string,
  propertyTitle: string,
  propertyId: string
) {
  return createNotification(
    agentId,
    "Bạn đã bị gỡ khỏi property",
    `${sellerName} đã gỡ bạn khỏi property "${propertyTitle}".`,
    {
      type: "property",
      relatedId: propertyId,
      actionUrl: `/notifications/properties/${propertyId}`,
    }
  );
}


export async function createNotificationsForUsers(
  userIds: string[],
  title: string,
  message: string,
  options?: {
    type?: NotificationType;
    relatedId?: string;
    actionUrl?: string;
    meta?: Record<string, any>;
  }
) {
  try {
    const promises = userIds.map((userId) =>
      createNotification(userId, title, message, options)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Failed to create notifications for users:", error);
  }
}


// Notification khi có appointment mới
export async function notifyNewAppointment(
  agentId: string,
  buyerName: string,
  propertyTitle: string,
  appointmentId: string,
  timesSummary?: string
) {
  const message =
    `${buyerName} đã đặt lịch hẹn xem ${propertyTitle}` +
    (timesSummary ? `\nCác khung giờ đề xuất:\n${timesSummary}` : "");

  return createNotification(agentId, "Lịch hẹn mới", message, {
    type: "appointment",
    relatedId: appointmentId,
    actionUrl: `/notifications/appointments/${appointmentId}`,
  });
}

export async function notifySellerNewAppointment(
  sellerId: string,
  buyerName: string,
  propertyTitle: string,
  appointmentId: string,
  timesSummary?: string
) {
  const message =
    `${buyerName} đã đặt lịch hẹn xem ${propertyTitle}` +
    (timesSummary ? `\nCác khung giờ đề xuất:\n${timesSummary}` : "");

  return createNotification(
    sellerId,
    "Lịch hẹn mới cho bất động sản của bạn",
    message,
    {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/notifications/appointments/${appointmentId}`,
    }
  );
}

// Notification khi agent accept/reject appointment
export async function notifyAppointmentStatus(
  buyerId: string,
  agentName: string,
  propertyTitle: string,
  status: "accepted" | "rejected",
  appointmentId: string
) {
  const title = status === "accepted" ? "Lịch hẹn được chấp nhận" : "Lịch hẹn bị từ chối";
  const message =
    status === "accepted"
      ? `${agentName} đã chấp nhận lịch hẹn xem ${propertyTitle}`
      : `${agentName} đã từ chối lịch hẹn xem ${propertyTitle}`;

  return createNotification(buyerId, title, message, {
    type: "appointment",
    relatedId: appointmentId,
    actionUrl: `/notifications/appointments/${appointmentId}`,
  });
}

// Notification khi agent accept/reject appointment - notify cả buyer và seller
export async function notifyAppointmentStatusToBuyerAndSeller(
  buyerId: string,
  sellerId: string,
  agentName: string,
  propertyTitle: string,
  status: "accepted" | "rejected",
  appointmentId: string,
  finalTimeText?: string
) {
  const title = status === "accepted" ? "Lịch hẹn được chấp nhận" : "Lịch hẹn bị từ chối";
  const buyerMessage =
    status === "accepted"
      ? `${agentName} đã chấp nhận lịch hẹn xem ${propertyTitle}${
          finalTimeText ? ` (khung giờ chốt: ${finalTimeText})` : ""
        }`
      : `${agentName} đã từ chối lịch hẹn xem ${propertyTitle}`;

  const sellerMessage =
    status === "accepted"
      ? `${agentName} đã chấp nhận lịch hẹn xem ${propertyTitle} của bạn${
          finalTimeText ? ` (khung giờ chốt: ${finalTimeText})` : ""
        }`
      : `${agentName} đã từ chối lịch hẹn xem ${propertyTitle} của bạn`;

  await Promise.all([
    createNotification(buyerId, title, buyerMessage, {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/notifications/appointments/${appointmentId}`,
    }),
    createNotification(sellerId, title, sellerMessage, {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/notifications/appointments/${appointmentId}`,
    }),
  ]);
}

export async function notifyAppointmentCancelled(
  agentId: string,
  sellerId: string,
  buyerName: string,
  propertyTitle: string,
  appointmentId: string
) {
  const message = `${buyerName} đã hủy lịch hẹn xem ${propertyTitle}`;
  await Promise.all([
    createNotification(agentId, "Lịch hẹn bị hủy", message, {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/appointments/${appointmentId}`,
    }),
    createNotification(sellerId, "Lịch hẹn bị hủy", message, {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/notifications/appointments/${appointmentId}`,
    }),
  ]);
}
// tbao hoàn tất appointment
export async function notifyAppointmentCompleted(params: {
  buyerId: string;
  sellerId: string;
  agentName: string;
  propertyTitle: string;
  appointmentId: string;
  finalTimeText?: string;
}) {
  const { buyerId, sellerId, agentName, propertyTitle, appointmentId, finalTimeText } = params;
  const message =
    `${agentName} đã xác nhận hoàn tất lịch hẹn xem ${propertyTitle}` +
    (finalTimeText ? ` (khung giờ: ${finalTimeText})` : "");

  await Promise.all([
    createNotification(buyerId, "Lịch hẹn đã hoàn tất", message, {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/appointments/${appointmentId}`,
    }),
    createNotification(sellerId, "Lịch hẹn đã hoàn tất", message, {
      type: "appointment",
      relatedId: appointmentId,
      actionUrl: `/notifications/appointments/${appointmentId}`,
    }),
  ]);
}

// Notification khi có offer mới
export async function notifyNewOffer(
  agentId: string,
  buyerName: string,
  propertyTitle: string,
  amount: number,
  offerId: string
) {
  return createNotification(
    agentId,
    "Offer mới",
    `${buyerName} đã đưa ra offer ${formatVND(amount)} cho ${propertyTitle}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: `/notifications/offers/${offerId}`,
    }
  );
}


export async function notifySellerNewOffer(
  sellerId: string,
  buyerName: string,
  propertyTitle: string,
  amount: number,
  offerId: string
) {
  return createNotification(
    sellerId,
    "Offer mới cho property của bạn",
    `${buyerName} đã gửi offer ${formatVND(amount)} cho ${propertyTitle}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: `/notifications/offers/${offerId}`,
    }
  );
}


// Notification khi agent accept/reject offer
export async function notifyOfferStatus(
  buyerId: string,
  agentName: string,
  propertyTitle: string,
  status: "accepted" | "rejected",
  offerId: string
) {
  const title = status === "accepted" ? "Offer được chấp nhận" : "Offer bị từ chối";
  const message =
    status === "accepted"
      ? `${agentName} đã chấp nhận offer của bạn cho ${propertyTitle}`
      : `${agentName} đã từ chối offer của bạn cho ${propertyTitle}`;

  return createNotification(buyerId, title, message, {
    type: "offer",
    relatedId: offerId,
    actionUrl: `/notifications/offers/${offerId}`,
  });
}

// Notification khi có tin nhắn mới (nếu receiver offline)
export async function notifyNewMessage(
  receiverId: string,
  senderName: string,
  message: string,
  conversationId: string
) {
  return createNotification(receiverId, `Tin nhắn mới từ ${senderName}`, message, {
    type: "chat",
    relatedId: conversationId,
    actionUrl: `/notifications/chat/${conversationId}`,
  });
}

// Notification khi property được approve/reject
export async function notifyPropertyStatus(
  userId: string, // owner hoặc agent
  propertyTitle: string,
  status: "approved" | "rejected",
  propertyId: string,
  reason?: string
) {
  const title = status === "approved" ? "Property được phê duyệt" : "Property bị từ chối";
  const message =
    status === "approved"
      ? `Property "${propertyTitle}" của bạn đã được phê duyệt`
      : `Property "${propertyTitle}" của bạn đã bị từ chối${reason ? `: ${reason}` : ""}`;

  return createNotification(userId, title, message, {
    type: "property",
    relatedId: propertyId,
    actionUrl: `/notifications/properties/${propertyId}`,
  });
}

// Notification khi agent forward offer cho seller
export async function notifyOfferForwarded(
  sellerId: string,
  agentName: string,
  propertyTitle: string,
  amount: number,
  offerId: string
) {
  return createNotification(
    sellerId,
    "Offer cần duyệt",
    `${agentName} đã forward offer ${amount.toLocaleString()} VNĐ cho ${propertyTitle}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: `/notifications/offers/${offerId}`,
    }
  );
}

// Notification khi seller accept offer
export async function notifyOfferAccepted(
  buyerId: string,
  agentId: string,
  sellerName: string,
  propertyTitle: string,
  offerId: string,
  dealId?: string
) {
  // Notify buyer
  await createNotification(
    buyerId,
    "Offer được chấp nhận",
    `Seller đã chấp nhận offer của bạn cho ${propertyTitle}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: dealId ? `/notifications/deals/${dealId}` : `/notifications/offers/${offerId}`,
    }
  );

  // Notify agent
  await createNotification(
    agentId,
    "Offer được chấp nhận",
    `${sellerName} đã chấp nhận offer cho ${propertyTitle}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: dealId ? `/notifications/deals/${dealId}` : `/notifications/offers/${offerId}`,
    }
  );
}

// Notification khi seller reject offer
export async function notifyOfferRejected(
  buyerId: string,
  agentId: string,
  sellerName: string,
  propertyTitle: string,
  offerId: string,
  reason?: string
) {
  // Notify buyer
  await createNotification(
    buyerId,
    "Offer bị từ chối",
    `Seller đã từ chối offer của bạn cho ${propertyTitle}${reason ? `: ${reason}` : ""}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: `/notifications/offers/${offerId}`,
    }
  );

  // Notify agent
  await createNotification(
    agentId,
    "Offer bị từ chối",
    `${sellerName} đã từ chối offer cho ${propertyTitle}${reason ? `: ${reason}` : ""}`,
    {
      type: "offer",
      relatedId: offerId,
      actionUrl: `/notifications/offers/${offerId}`,
    }
  );
}

// Notification khi tạo deal mới
export async function notifyDealCreated(
  buyerId: string,
  sellerId: string,
  agentId: string,
  propertyTitle: string,
  dealId: string
) {
  const message = `Deal mới đã được tạo cho ${propertyTitle}`;

  await Promise.all([
    createNotification(buyerId, "Deal mới", message, {
      type: "system",
      relatedId: dealId,
      actionUrl: `/notifications/deals/${dealId}`,
    }),
    createNotification(sellerId, "Deal mới", message, {
      type: "system",
      relatedId: dealId,
      actionUrl: `/notifications/deals/${dealId}`,
    }),
    createNotification(agentId, "Deal mới", message, {
      type: "system",
      relatedId: dealId,
      actionUrl: `/notifications/deals/${dealId}`,
    }),
  ]);
}

// Notification khi Agent upload hoặc cập nhật hợp đồng
export async function notifyContractUploaded(params: {
  recipientIds: string[];
  actorName: string;
  actorRole: string;
  propertyTitle: string;
  dealId: string;
  contractId: string;
  action: "uploaded" | "updated";
}) {
  const { recipientIds, actorName, actorRole, propertyTitle, dealId, contractId, action } = params;

  const isUpdate = action === "updated";
  const title = isUpdate ? "Hợp đồng được cập nhật" : "Hợp đồng mới";
  const actionVerb = isUpdate ? "đã cập nhật" : "đã tải lên";

  const message = `${actorName} (${actorRole}) ${actionVerb} hợp đồng cho giao dịch "${propertyTitle}"`;
  const actionUrl = `/notifications/deals/${dealId}/contract`;

  await createNotificationsForUsers(recipientIds, title, message, {
    type: "contract",
    relatedId: contractId,
    actionUrl,
    meta: {
      dealId,
      contractId,
      propertyTitle,
      actorRole,
      action,
    },
  });
}

/**
 * Notification khi Admin phê duyệt hoặc từ chối hợp đồng
 */
export async function notifyContractReviewResult(params: {
  contract: any;
  deal: any;
  result: "approved" | "rejected";
  adminName: string;
  notes?: string;
}) {
  const { contract, deal, result, adminName, notes } = params;

  // Validate dữ liệu để tránh crash
  if (!deal || !deal.buyer_id || !deal.seller_id || !deal.agent_id) {
    console.error("Deal data is incomplete for contract review notification.");
    return;
  }

  // Lấy tên property an toàn (tránh lỗi [object Object])
  const propertyTitle = deal.property_id?.title?.vi || deal.property_id?.title || "Bất động sản";

  const isApproved = result === "approved";
  const title = isApproved ? "Hợp đồng đã được phê duyệt" : "Hợp đồng bị từ chối";

  const message = `${adminName} (${isApproved ? "đã phê duyệt" : "đã từ chối"}) hợp đồng cho property "${propertyTitle}".${!isApproved && notes ? ` Lý do: ${notes}` : ""}`;

  const actionUrl = `/notifications/deals/${deal._id}/contract`;

  // Lấy ID của các bên liên quan
  const recipientIds = [
    deal.buyer_id._id || deal.buyer_id,
    deal.seller_id._id || deal.seller_id,
    deal.agent_id._id || deal.agent_id
  ].map(id => id.toString()).filter(Boolean);

  await createNotificationsForUsers(recipientIds, title, message, {
    type: "contract",
    relatedId: contract._id,
    actionUrl,
    meta: {
      dealId: deal._id,
      contractId: contract._id,
      result,
      notes,
    },
  });
}

/**
 * Notification khi trạng thái Deal thay đổi
 */
export async function notifyDealStatusChange(params: {
  deal: any;
  newStatus: string; // Hoặc DealStatus nếu bạn đã import
  adminName: string;
}) {
  const { deal, newStatus, adminName } = params;

  if (!deal || !deal.buyer_id || !deal.seller_id || !deal.agent_id) {
    console.error("Deal data is incomplete for status change notification.");
    return;
  }

  const propertyTitle = deal.property_id?.title?.vi || deal.property_id?.title || "Bất động sản";

  const title = `Trạng thái Deal được cập nhật: ${newStatus.toUpperCase()}`;
  const message = `${adminName} đã cập nhật trạng thái Deal cho property "${propertyTitle}" thành **${newStatus}**`;

  const actionUrl = `/notifications/deals/${deal._id}`;

  const recipientIds = [
    deal.buyer_id._id || deal.buyer_id,
    deal.seller_id._id || deal.seller_id,
    deal.agent_id._id || deal.agent_id
  ].map(id => id.toString()).filter(Boolean);

  await createNotificationsForUsers(recipientIds, title, message, {
    type: "deal", // Đảm bảo 'deal' có trong NotificationType, nếu không dùng 'system'
    relatedId: deal._id,
    actionUrl,
    meta: { dealId: deal._id, newStatus },
  });
}

/**
 * Notification khi Payment được tạo hoặc cập nhật
 */
export async function notifyPaymentUpdate(params: {
  payment: any;
  deal: any;
  adminName: string;
  action: "created" | "updated";
}) {
  const { payment, deal, adminName, action } = params;

  if (!deal || !payment.initiated_by) {
    console.error("Deal/Payment data is incomplete for payment update notification.");
    return;
  }

  const propertyTitle = deal.property_id?.title?.vi || deal.property_id?.title || "Bất động sản";

  const isCreated = action === "created";
  const title = isCreated ? "Thanh toán mới được ghi nhận" : "Cập nhật Thanh toán";
  const statusMessage = payment.status ? ` (Trạng thái: ${payment.status})` : "";

  const message = `${adminName} ${isCreated ? "đã ghi nhận" : "đã cập nhật"} thanh toán ${formatVND(payment.amount)} VNĐ cho ${propertyTitle}${statusMessage}`;

  const actionUrl = `/notifications/deals/${deal._id}/payments`;

  // Gửi cho người thực hiện thanh toán và Agent
  const recipientIds = [
    payment.initiated_by._id || payment.initiated_by,
    deal.agent_id?._id || deal.agent_id
  ].map(id => id?.toString()).filter(Boolean);

  await createNotificationsForUsers(recipientIds, title, message, {
    type: "payment",
    relatedId: payment._id,
    actionUrl,
    meta: { dealId: deal._id, paymentId: payment._id, amount: payment.amount, status: payment.status },
  });
}

// Notification khi Buyer chấp nhận hoặc từ chối hợp đồng
export async function notifyBuyerContractDecision(params: {
  deal: any; // Object deal đã populate seller_id, agent_id, property_id
  buyerName: string;
  contractId: string;
  decision: "approved" | "rejected";
  notes?: string;
}) {
  const { deal, buyerName, contractId, decision, notes } = params;

  const propertyTitle = deal.property_id?.title?.vi || deal.property_id?.title || "Bất động sản";
  const actionText = decision === "approved" ? "đã chấp nhận" : "đã từ chối";
  const title = decision === "approved" ? "Hợp đồng được chấp nhận" : "Hợp đồng bị từ chối";

  const message = `${buyerName} (Người mua) ${actionText} hợp đồng cho "${propertyTitle}".${decision === "rejected" && notes ? ` Lý do: ${notes}` : ""}`;

  // Gửi cho Seller và Agent
  const recipientIds = [
    deal.seller_id?._id?.toString() || deal.seller_id?.toString(),
    deal.agent_id?._id?.toString() || deal.agent_id?.toString()
  ].filter(Boolean);

  const actionUrl = `/notifications/deals/${deal._id}`; // Hoặc URL chi tiết hợp đồng

  await createNotificationsForUsers(recipientIds, title, message, {
    type: "contract",
    relatedId: contractId,
    actionUrl,
    meta: {
      dealId: deal._id,
      contractId,
      decision,
    },
  });
}

export async function notifyBuyerToPayEscrow(
  buyerId: string,
  dealId: string,
  propertyTitle: string,
  platformFee: number,
  agentFee: number
) {
  const title = "Thanh toán Escrow";
  const message = `Hợp đồng bất động sản "${propertyTitle}" đã được chấp nhận.
Vui lòng tiến hành thanh toán escrow: 
- Giá trị: ${formatVND(platformFee + agentFee)} (bao gồm phí nền tảng ${formatVND(platformFee)}, phí agent ${formatVND(agentFee)})
- Hoặc thanh toán trực tiếp với chủ nhà bằng tiền mặt.`;

  return createNotification(buyerId, title, message, {
    type: "system",
    relatedId: dealId,
    actionUrl: `/deals/${dealId}/payment` // link tới trang thanh toán
  });
}

export async function notifyPaymentSuccessBuyer(buyerId: string, deal: any) {
  return createNotification(
    buyerId,
    "Thanh toán thành công",
    `Bạn đã thanh toán escrow cho bất động sản "${deal.property_id.title}".`
  );
}

export async function notifyPaymentSuccessSellerAgent(deal: any) {
  const seller = String(deal.seller_id);
  const agent = String(deal.agent_id);

  await createNotification(
    seller,
    "Bạn đã nhận được tiền BĐS",
    "Hệ thống đã chuyển tiền cho bạn."
  );

  await createNotification(
    agent,
    "Bạn đã nhận tiền hoa hồng",
    "Hệ thống đã gửi phí agent cho bạn."
  );
}