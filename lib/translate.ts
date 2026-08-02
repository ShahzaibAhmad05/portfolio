export async function translateText(text: string, to: string) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return null;

  const url = new URL(
    "https://translation.googleapis.com/language/translate/v2",
  );
  url.searchParams.set("key", key);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: to, format: "text" }),
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: { translations?: { translatedText?: string }[] };
  };
  return json.data?.translations?.[0]?.translatedText ?? null;
}
