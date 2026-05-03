import { NextResponse } from "next/server";
import { getAlertSmsPhone, sendAdminAlertSMS } from "@/lib/actions/notification.actions";

const INFOBIP_API_KEY =
  process.env.INFOBIP_API_KEY ||
  "433c3b0dcfe954ceece1f315f39423b4-ea583b0b-644a-48ab-af7e-aee9e02e3860";
const INFOBIP_BASE_URL =
  process.env.INFOBIP_BASE_URL || "https://x111p4.api.infobip.com";

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown SMS error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unable to stringify SMS error";
  }
}

async function fetchDeliveryReport(messageId: string) {
  try {
    const url = `${INFOBIP_BASE_URL}/sms/1/reports?messageId=${encodeURIComponent(messageId)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `App ${INFOBIP_API_KEY}`,
        Accept: "application/json",
      },
    });
    const data = await res.json().catch(() => null);
    const report = data?.results?.[0];
    if (!report) return null;
    return {
      messageId: report.messageId,
      to: report.to,
      statusGroup: report.status?.groupName,
      statusName: report.status?.name,
      statusDescription: report.status?.description,
      error: report.error?.name || null,
      sentAt: report.sentAt,
      doneAt: report.doneAt,
      raw: data,
    };
  } catch {
    return null;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const maxDuration = 20; // allow up to 20s for the route

export async function POST() {
  const phone = await getAlertSmsPhone();
  const text = `Test SMS MediFollow\nTo: ${phone}\nTime: ${new Date().toLocaleString("fr-FR")}`;

  try {
    const result = await sendAdminAlertSMS(text);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          phone,
          message: "SMS send failed — Infobip rejected the request",
          detail: getErrorMessage("error" in result ? result.error : result.reason),
        },
        { status: 500 }
      );
    }

    const sendDetail = "detail" in result ? result.detail : undefined;
    const messageId = sendDetail?.messageId as string | undefined;

    // Poll delivery report after a short wait so we get the carrier result
    let deliveryReport = null;
    if (messageId) {
      await sleep(5000);
      deliveryReport = await fetchDeliveryReport(messageId);
    }

    const deliveredStatus = deliveryReport?.statusGroup;
    const isDelivered = deliveredStatus === "DELIVERED";

    const sendStatus = sendDetail
      ? `${sendDetail.statusGroup || "?"} / ${sendDetail.statusName || "?"}`
      : "unknown";
    const deliveryStatus = deliveryReport
      ? `${deliveryReport.statusGroup || "?"} / ${deliveryReport.statusName || "?"} — ${deliveryReport.statusDescription || ""}`
      : "No delivery report yet (report may arrive after a short delay)";

    return NextResponse.json({
      success: true,
      phone,
      delivered: isDelivered,
      message: isDelivered
        ? `✅ SMS delivered to ${phone}`
        : `⚠️ SMS accepted but not yet delivered to ${phone}`,
      sendStatus,
      deliveryStatus,
      messageId,
      error: deliveryReport?.error || null,
      sendDetail,
      deliveryReport,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        phone,
        message: "SMS test failed",
        detail: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}