// src/utils/responseHandler.ts
import { Request, Response } from "express";

export const successResponse = (
  reqOrRes: Request | Response,
  resOrMessage: Response | string,
  messageOrData?: string | any,
  data?: any
) => {
  let req: Request | null = null;
  let res: Response;
  let messageKey: string;
  let payload: any;

  // Trường hợp: successResponse(req, res, messageKey, data)
  if ("t" in (reqOrRes as Request)) {
    req = reqOrRes as Request;
    res = resOrMessage as Response;
    messageKey = messageOrData as string;
    payload = data;
  }
  // Trường hợp cũ: successResponse(res, messageKey, data)
  else {
    res = reqOrRes as Response;
    messageKey = resOrMessage as string;
    payload = messageOrData;
  }

  const message = req?.t ? req.t(messageKey) : messageKey;
  return res.status(200).json({ success: true, message, data: payload });
};

export const errorResponse = (
  reqOrRes: Request | Response,
  resOrMessage: Response | string,
  messageOrStatus?: string | number,
  statusCode = 400
) => {
  let req: Request | null = null;
  let res: Response;
  let messageKey: string;
  let code: number;

  // Trường hợp: errorResponse(req, res, messageKey, statusCode)
  if ("t" in (reqOrRes as Request)) {
    req = reqOrRes as Request;
    res = resOrMessage as Response;
    messageKey = messageOrStatus as string;
    code = statusCode;
  }
  // Trường hợp cũ: errorResponse(res, messageKey, statusCode)
  else {
    res = reqOrRes as Response;
    messageKey = resOrMessage as string;
    code = (messageOrStatus as number) || 400;
  }

  const message = req?.t ? req.t(messageKey) : messageKey;
  return res.status(code).json({ success: false, message });
};
