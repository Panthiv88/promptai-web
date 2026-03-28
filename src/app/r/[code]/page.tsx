import { redirect } from "next/navigation";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/promptai-%E2%80%93-prompt-enhance/ibaoelckmaefmkiafoaaalbcjblnfjjd";

// Valid creator codes — add one per creator before launching their video
const CREATOR_CODES: Record<string, boolean> = {
  c1: true,
  c2: true,
  c3: true,
  c4: true,
  c5: true,
  c6: true,
  c7: true,
  c8: true,
};

// Note: In Next.js 15+, params is a Promise and must be awaited
export default async function CreatorRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode?.toLowerCase();

  if (!CREATOR_CODES[code]) {
    redirect("/");
  }

  redirect(CHROME_STORE_URL);
}
