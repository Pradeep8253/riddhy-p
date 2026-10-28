import { getCuratedLook } from "@/lib/catalogue";
import { ok, apiError } from "@/lib/http";

export const revalidate = 60;

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const room = url.searchParams.get("room") || "living";
    const data = await getCuratedLook(room);
    return ok(data);
  } catch (error) {
    return apiError(error);
  }
}

