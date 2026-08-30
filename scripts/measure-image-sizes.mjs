
const strapiUrl = (process.env.STRAPI_PUBLIC_URL ?? "http://localhost:1337").replace(/\/+$/, "");
const OVERSIZED_BYTES = 300 * 1024;

async function fetchJson(path) {
  const response = await fetch(`${strapiUrl}${path}`);
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}`);
  return response.json();
}

function resolveUrl(url) {
  if (!url) return null;
  return /^https?:\/\//.test(url) ? url : `${strapiUrl}${url}`;
}

async function measureImage(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const bytes = Number(response.headers.get("content-length") ?? "0");
    const type = response.headers.get("content-type") ?? "desconhecido";
    return { url, ok: response.ok, bytes, type };
  } catch (error) {
    return { url, ok: false, bytes: 0, type: "erro", error: String(error) };
  }
}

async function collectImageUrls() {
  const urls = new Set();

  const quizzes = await fetchJson("/api/quizzes?pagination[pageSize]=100&populate=image");
  for (const item of quizzes.data ?? []) {
    const image = item.attributes?.image ?? item.image;
    const url = resolveUrl(image?.data?.attributes?.url ?? image?.url);
    if (url) urls.add(url);
  }

  const posts = await fetchJson("/api/blog-posts?pagination[pageSize]=100&populate=coverImage");
  for (const item of posts.data ?? []) {
    const image = item.attributes?.coverImage ?? item.coverImage;
    const url = resolveUrl(image?.data?.attributes?.url ?? image?.url);
    if (url) urls.add(url);
  }

  return [...urls];
}

async function main() {
  console.log(`Medindo imagens em ${strapiUrl} ...`);
  const urls = await collectImageUrls();
  if (urls.length === 0) {
    console.log("Nenhuma imagem encontrada (Strapi vazio ou sem dados publicados).");
    return;
  }

  const results = await Promise.all(urls.map(measureImage));
  results.sort((a, b) => b.bytes - a.bytes);

  console.log(`\n${results.length} imagens:\n`);
  for (const result of results) {
    const kb = (result.bytes / 1024).toFixed(0);
    const flag = result.bytes > OVERSIZED_BYTES ? "  <-- acima de 300KB" : "";
    console.log(`${kb.padStart(6)} KB  ${result.type.padEnd(24)} ${result.url}${flag}`);
  }

  const oversized = results.filter((r) => r.bytes > OVERSIZED_BYTES);
  console.log(`\n${oversized.length} de ${results.length} imagens acima de 300KB.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
