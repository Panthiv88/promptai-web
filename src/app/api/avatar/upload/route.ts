import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Node runtime — @vercel/blob uses Node APIs and needs BLOB_READ_WRITE_TOKEN.
export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function randomSlug(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: NextRequest) {
  // Auth is enforced downstream: the backend POST /api/users/me/avatar
  // requires a valid session before the returned URL can be attached to a user.
  // An orphaned blob from an unauthenticated caller is harmless — size + type
  // caps below bound the worst case.
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file field required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File must be PNG, JPEG, WebP, or GIF" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 2MB or smaller" },
      { status: 413 },
    );
  }

  const ext = EXT_BY_TYPE[file.type] || "bin";
  const pathname = `avatars/${randomSlug()}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
