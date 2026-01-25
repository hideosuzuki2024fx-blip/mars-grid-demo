import type { NextRequest } from "next/server";

export function assertAdmin(req: NextRequest) {
  const expected = process.env.CX_ADMIN_KEY ?? "";
  if (!expected) {
    throw new Error("CX_ADMIN_KEY is not set");
  }
  const key = req.headers.get("x-admin-key") ?? "";
  if (key !== expected) {
    const err = new Error("ADMIN_FORBIDDEN");
    // @ts-expect-error
    err.code = "ADMIN_FORBIDDEN";
    throw err;
  }
}
