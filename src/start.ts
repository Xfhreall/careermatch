import { redirect } from "@tanstack/react-router";
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";

import {
  type AppRole,
  getDashboardPathForRole,
  getUserRole,
} from "@/features/auth/role-routing";
import { auth } from "@/lib/auth";

const ROUTE_ROLE_RULES: Array<{ allowedRoles: AppRole[]; prefix: string }> = [
  { prefix: "/jobseeker", allowedRoles: ["jobseeker"] },
  { prefix: "/hrd", allowedRoles: ["hrd", "superadmin"] },
  { prefix: "/superadmin", allowedRoles: ["superadmin"] },
  { prefix: "/interview/coach", allowedRoles: ["jobseeker", "hrd"] },
];

function resolveAllowedRoles(pathname: string): AppRole[] | null {
  const rule = ROUTE_ROLE_RULES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );
  return rule?.allowedRoles ?? null;
}

const roleAccessMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const pathname = new URL(request.url).pathname;
    const allowedRoles = resolveAllowedRoles(pathname);

    if (!allowedRoles) {
      return next();
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw redirect({
        replace: true,
        to: "/login",
      });
    }

    const role = getUserRole(session.user);

    if (!allowedRoles.includes(role)) {
      throw redirect({
        replace: true,
        to: getDashboardPathForRole(role),
      });
    }

    return next();
  },
);

const csrfMiddleware = createCsrfMiddleware({
  secFetchSite: ["none", "same-origin"],
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, roleAccessMiddleware],
}));
