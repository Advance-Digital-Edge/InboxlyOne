// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Ясно описани позволени пътища
const ALLOWED_EXACT = new Set<string>([
  "/", // landing page
  "/tos", // terms of service
  "/privacy-policy", // privacy policy
  "/robots.txt",
  "/sitemap.xml",
]);
const ALLOWED_PREFIX = ["/api/subscribe"]; // API за waitlist

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // позволи само landing + subscribe API (+ вътрешни/статични от matcher-а)
  const isAllowed =
    ALLOWED_EXACT.has(pathname) ||
    ALLOWED_PREFIX.some((p) => pathname.startsWith(p));

  if (!isAllowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // за позволените пътища си пазим Supabase сесията
  return await updateSession(request);
}

// Оставяме твоя matcher почти същия – вече изключва _next и изображенията
export const config = {
  matcher: [
    // минаваме през middleware за всичко, освен изброените статични
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
