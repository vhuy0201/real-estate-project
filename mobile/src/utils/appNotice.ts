export type AppNoticeType = "success" | "error" | "info";

export type AppNoticePayload = {
  type: AppNoticeType;
  title?: string;
  message: string;
};

let noticeListener: ((payload: AppNoticePayload) => void) | null = null;

export function setAppNoticeListener(
  listener: ((payload: AppNoticePayload) => void) | null,
) {
  noticeListener = listener;
}

export function showAppNotice(payload: AppNoticePayload) {
  noticeListener?.(payload);
}

