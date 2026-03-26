// src/services/assignment.service.ts
import Assignment from "../models/assignment.model";
import Property from "../models/property.model";
import User from "../models/user.model";
import mongoose from "mongoose";
import {
  notifyAssignmentRequest,
  notifyAssignmentAccepted,
  notifyAssignmentRejected,
  notifyAssignmentCancelled,
  notifyAssignmentCancelledByAgent,
} from "../utils/notificationHelper";

export const assignmentService = {
  async createRequest(propertyId: string, agentId: string, ownerId: string, note?: string) {
    // check property exists & owner matches
    const property = await Property.findById(propertyId);
    if (!property) throw Object.assign(new Error("Property không tồn tại"), { status: 404 });
    if (property.owner_id?.toString() !== ownerId) throw Object.assign(new Error("Không có quyền"), { status: 403 });

    const existing = await Assignment.findOne({ property_id: propertyId, agent_id: agentId, status: "pending" });
    if (existing) throw Object.assign(new Error("Đã có yêu cầu đang chờ với agent này"), { status: 409 });

    const doc = await Assignment.create({
      property_id: propertyId,
      agent_id: agentId,
      owner_id: ownerId,
      note,
      createdBy: new mongoose.Types.ObjectId(ownerId),
    });

    // push assignmentHistory
    property.assignmentHistory = property.assignmentHistory || [];
    property.assignmentHistory.push({
      agent_id: new mongoose.Types.ObjectId(agentId),
      assignedBy: new mongoose.Types.ObjectId(ownerId),
      action: "request",
      assignedAt: new Date(),
    });
    await property.save();

    //create notification to agent
    try {
      const owner = await User.findById(ownerId).select("fullName").lean();
      if (owner) {
        await notifyAssignmentRequest(
          agentId,
          owner.fullName,
          property.title.vi, // Hoặc property.title[lang] nếu bạn có
          String(doc._id)
        );
      }
    } catch (notifyError) {
      console.error("Failed to send notification in createRequest:", notifyError);
    }

    return doc;
  },

  async getRequestsForAgent(agentId: string, filters: any = {}) {
    const query: any = { agent_id: agentId };
    if (filters.status) query.status = filters.status;
    return Assignment.find(query)
      .populate("property_id", "title address price owner_id images")
      .populate("owner_id", "fullName email phone")
      .sort({ createdAt: -1 })
      .lean();
  },

  async acceptRequest(assignmentId: string, agentId: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw Object.assign(
      new Error("Yêu cầu không tồn tại"),
      { status: 404 }
    );
    if (!assignment.agent_id || String(assignment.agent_id) !== String(agentId)) throw Object.assign(
      new Error("Không phải request của agent này"),
      { status: 403 }
    );
    if (assignment.status !== "pending") throw Object.assign(
      new Error("Yêu cầu không ở trạng thái pending"),
      { status: 400 }
    );

    // Set property.agent_id and push history
    const property = await Property.findById(assignment.property_id);
    if (!property) throw Object.assign(
      new Error("Property không tồn tại"),
      { status: 404 }
    );

    if (property.agent_id) throw Object.assign(
      new Error("Property đã có agent"),
      { status: 409 }
    );

    if (property.coordinates && property.coordinates.type === 'Point') {
      const coords = property.coordinates.coordinates;

      if (!coords || (coords as any).length === 0) {
        property.coordinates = undefined;
      }
    }

    property.assignmentHistory = property.assignmentHistory || [];
    property.assignmentHistory.push({
      agent_id: assignment.agent_id,
      assignedBy: new mongoose.Types.ObjectId(agentId),
      action: "assign",
      assignedAt: new Date(),
    } as any);

    property.agent_id = assignment.agent_id;
    await property.save();

    assignment.status = "accepted";
    assignment.actedBy = new mongoose.Types.ObjectId(agentId);
    assignment.actedAt = new Date();
    await assignment.save();

    // <<< GỬI NOTIFICATION CHO SELLER
    try {
      const agent = await User.findById(agentId).select("fullName").lean();
      if (agent) {
        await notifyAssignmentAccepted(
          assignment.owner_id.toString(),
          agent.fullName,
          property.title.vi,
          String(assignment._id)
        );
      }
    } catch (notifyError) {
      console.error("Failed to send notification in acceptRequest:", notifyError);
    }

    return { assignment, property };
  },

  async rejectRequest(assignmentId: string, agentId: string, reason?: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw Object.assign(new Error("Yêu cầu không tồn tại"), { status: 404 });
    if (!assignment.agent_id || String(assignment.agent_id) !== String(agentId)) throw Object.assign(new Error("Không phải request của agent này"), { status: 403 });
    if (assignment.status !== "pending") throw Object.assign(new Error("Yêu cầu không ở trạng thái pending"), { status: 400 });

    assignment.status = "rejected";
    assignment.actedBy = new mongoose.Types.ObjectId(agentId);
    assignment.actedAt = new Date();
    if (reason) (assignment as any).note = reason;
    await assignment.save();

    //GỬI NOTIFICATION CHO SELLER
    try {
      // Cần lấy property title và agent name
      const [agent, property] = await Promise.all([
        User.findById(agentId).select("fullName").lean(),
        Property.findById(assignment.property_id).select("title.vi").lean(),
      ]);

      if (agent && property) {
        await notifyAssignmentRejected(
          assignment.owner_id.toString(),
          agent.fullName,
          property.title.vi,
          String(assignment._id),
          reason
        );
      }
    } catch (notifyError) {
      console.error("Failed to send notification in rejectRequest:", notifyError);
    }

    const property = await Property.findById(assignment.property_id);
    if (property) {
      property.assignmentHistory = property.assignmentHistory || [];
      property.assignmentHistory.push({
        agent_id: assignment.agent_id,
        assignedBy: new mongoose.Types.ObjectId(agentId),
        action: "reject",
        assignedAt: new Date(),
      } as any);
      await property.save();
    }

    return assignment;
  },

  async cancelRequest(assignmentId: string, ownerId: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw Object.assign(new Error("Yêu cầu không tồn tại"), { status: 404 });

    // Kiểm tra quyền (chỉ owner của request mới được hủy)
    if (String(assignment.owner_id) !== String(ownerId)) {
      throw Object.assign(new Error("Không có quyền hủy yêu cầu này"), { status: 403 });
    }

    // chỉ được hủy khi còn pending
    if (assignment.status !== "pending") {
      throw Object.assign(new Error("Chỉ có thể hủy yêu cầu khi đang ở trạng thái pending"), { status: 400 });
    }

    // Cập nhật trạng thái
    assignment.status = "cancelled";
    assignment.actedBy = new mongoose.Types.ObjectId(ownerId);
    assignment.actedAt = new Date();
    await assignment.save();

    // <<< GỬI NOTIFICATION CHO AGENT
    try {
      const [owner, property] = await Promise.all([
        User.findById(ownerId).select("fullName").lean(),
        Property.findById(assignment.property_id).select("title.vi").lean(),
      ]);

      if (owner && property) {
        await notifyAssignmentCancelled(
          assignment.agent_id.toString(),
          owner.fullName,
          property.title.vi,
          String(assignment._id)
        );
      }
    } catch (notifyError) {
      console.error(
        "Failed to send notification in cancelRequest:",
        notifyError
      );
    }

    // Ghi lại vào lịch sử property
    const property = await Property.findById(assignment.property_id);
    if (property) {
      property.assignmentHistory = property.assignmentHistory || [];
      property.assignmentHistory.push({
        agent_id: assignment.agent_id,
        assignedBy: new mongoose.Types.ObjectId(ownerId),
        action: "cancel",
        assignedAt: new Date(),
      } as any);
      await property.save();
    }

    // Optional: tạo notification cho agent rằng request đã bị hủy
    return assignment;
  },

  async agentRequestManage(propertyId: string, agentId: string, note?: string) {
    // Kiểm tra property tồn tại
    const property = await Property.findById(propertyId);
    if (!property) {
      throw Object.assign(new Error("Property không tồn tại"), { status: 404 });
    }

    const ownerId = property.owner_id?.toString();
    if (!ownerId) {
      throw Object.assign(new Error("Property không có owner"), { status: 400 });
    }

    // Kiểm tra có yêu cầu pending nào giữa agent → property chưa?
    const existing = await Assignment.findOne({
      property_id: propertyId,
      agent_id: agentId,
      status: "pending"
    });

    if (existing) {
      throw Object.assign(new Error("Bạn đã gửi yêu cầu rồi, vui lòng chờ seller phản hồi"), {
        status: 409,
      });
    }

    const doc = await Assignment.create({
      property_id: propertyId,
      agent_id: agentId,
      owner_id: ownerId,
      note,
      createdBy: new mongoose.Types.ObjectId(agentId),
    });

    // Lưu lịch sử
    property.assignmentHistory = property.assignmentHistory || [];
    property.assignmentHistory.push({
      agent_id: new mongoose.Types.ObjectId(agentId),
      assignedBy: new mongoose.Types.ObjectId(agentId),
      action: "request",
      assignedAt: new Date(),
    });

    await property.save();

    // Gửi thông báo tới seller
    try {
      const agent = await User.findById(agentId).select("fullName").lean();
      if (agent) {
        await notifyAssignmentRequest(
          ownerId,
          agent.fullName,
          property.title.vi,
          String(doc._id)
        );
      }
    } catch (notifyError) {
      console.error("Failed to send notification:", notifyError);
    }

    return doc;
  },
  async getRequestsForSeller(sellerId: string, filters: any = {}) {
    const sellerProperties = await Property.find({
      owner_id: sellerId, 
      deleted: { $ne: true },
    }).select("_id");

    const propertyIds = sellerProperties.map((p) => p._id);

    if (propertyIds.length === 0) return [];

    const query: any = {
      property_id: { $in: propertyIds },
      deleted: { $ne: true },
    };

    if (filters.status) query.status = filters.status;

    return Assignment.find(query)
      .populate("property_id", "title address price agent_id images")
      .populate("agent_id", "fullName email phone")
      .sort({ createdAt: -1 })
      .lean();
  },


  async sellerAcceptRequest(assignmentId: string, sellerId: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw Object.assign(new Error("Yêu cầu không tồn tại"), { status: 404 });

    if (String(assignment.owner_id) !== String(sellerId))
      throw Object.assign(new Error("Không phải yêu cầu gửi đến seller này"), { status: 403 });

    if (assignment.status !== "pending")
      throw Object.assign(new Error("Yêu cầu không ở trạng thái pending"), { status: 400 });

    // Set property.agent_id
    const property = await Property.findById(assignment.property_id);
    if (!property) throw Object.assign(new Error("Property không tồn tại"), { status: 404 });

    if (property.agent_id)
      throw Object.assign(new Error("Property đã có agent"), { status: 409 });

    if (property.coordinates && property.coordinates.type === 'Point') {
      const coords = property.coordinates.coordinates;

      if (!coords || (coords as any).length === 0) {
        property.coordinates = undefined;
      }
    }

    // Add history
    property.assignmentHistory = property.assignmentHistory || [];
    property.assignmentHistory.push({
      agent_id: assignment.agent_id,
      assignedBy: new mongoose.Types.ObjectId(sellerId),
      action: "assign",
      assignedAt: new Date(),
    });
    property.agent_id = assignment.agent_id;
    await property.save();

    // update assignment
    assignment.status = "accepted";
    assignment.actedBy = new mongoose.Types.ObjectId(sellerId);
    assignment.actedAt = new Date();
    await assignment.save();

    // notify agent
    try {
      const seller = await User.findById(sellerId).select("fullName").lean();
      if (seller) {
        await notifyAssignmentAccepted(
          assignment.agent_id.toString(),
          seller.fullName,
          property.title.vi,
          String(assignment._id)
        );
      }
    } catch (err) {
      console.error("notify error:", err);
    }

    return { assignment, property };
  },

  async sellerRejectRequest(assignmentId: string, sellerId: string, reason?: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw Object.assign(new Error("Yêu cầu không tồn tại"), { status: 404 });

    if (String(assignment.owner_id) !== String(sellerId))
      throw Object.assign(new Error("Không phải yêu cầu gửi đến seller này"), { status: 403 });

    if (assignment.status !== "pending")
      throw Object.assign(new Error("Yêu cầu không ở trạng thái pending"), { status: 400 });

    assignment.status = "rejected";
    assignment.actedBy = new mongoose.Types.ObjectId(sellerId);
    assignment.actedAt = new Date();
    if (reason) assignment.note = reason;
    await assignment.save();

    // Add history
    const property = await Property.findById(assignment.property_id);
    if (property) {
      property.assignmentHistory = property.assignmentHistory || [];
      property.assignmentHistory.push({
        agent_id: assignment.agent_id,
        assignedBy: new mongoose.Types.ObjectId(sellerId),
        action: "reject",
        assignedAt: new Date(),
      });
      await property.save();
    }

    // notify agent
    try {
      const seller = await User.findById(sellerId).select("fullName").lean();
      const propertyInfo = await Property.findById(assignment.property_id).select("title.vi");

      if (seller && propertyInfo) {
        await notifyAssignmentRejected(
          assignment.agent_id.toString(),
          seller.fullName,
          propertyInfo.title.vi,
          String(assignment._id),
          reason
        );
      }
    } catch (err) {
      console.error("notify error:", err);
    }

    return assignment;
  },

  async cancelRequestByAgent(assignmentId: string, agentId: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      throw Object.assign(new Error("Yêu cầu không tồn tại"), { status: 404 });

    // Chỉ agent của request được phép hủy
    if (String(assignment.agent_id) !== String(agentId)) {
      throw Object.assign(new Error("Không có quyền hủy yêu cầu này"), {
        status: 403,
      });
    }

    // Chỉ được hủy khi còn pending
    if (assignment.status !== "pending") {
      throw Object.assign(
        new Error("Chỉ có thể hủy yêu cầu khi đang ở trạng thái pending"),
        { status: 400 }
      );
    }

    // Cập nhật trạng thái
    assignment.status = "cancelled";
    assignment.actedBy = new mongoose.Types.ObjectId(agentId);
    assignment.actedAt = new Date();
    await assignment.save();

    // GỬI NOTIFICATION CHO SELLER
    try {
      const [agent, property] = await Promise.all([
        User.findById(agentId).select("fullName").lean(),
        Property.findById(assignment.property_id).select("title.vi").lean(),
      ]);

      if (agent && property) {
        await notifyAssignmentCancelledByAgent(
          assignment.owner_id.toString(), // seller nhận thông báo
          agent.fullName,
          property.title.vi,
          String(assignment._id)
        );
      }
    } catch (notifyError) {
      console.error(
        "Failed to send notification in cancelRequestByAgent:",
        notifyError
      );
    }

    // Ghi lịch sử vào property
    const property = await Property.findById(assignment.property_id);
    if (property) {
      property.assignmentHistory = property.assignmentHistory || [];
      property.assignmentHistory.push({
        agent_id: assignment.agent_id,
        assignedBy: new mongoose.Types.ObjectId(agentId),
        action: "agent_cancel",
        assignedAt: new Date(),
      } as any);
      await property.save();
    }

    return assignment;
  },


};