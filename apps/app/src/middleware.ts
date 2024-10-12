import { NextResponse } from "next/server";
import { auth as middleware } from "./auth";

export default middleware(async (request) => {
  const { nextUrl } = request;

  const isLoggedIn = request.auth;

  const isAuthPage = nextUrl.pathname.startsWith("/auth");
  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  if (!isLoggedIn && !isAuthPage && !isApiRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  if (!isLoggedIn && isOnboardingPage && !isApiRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
