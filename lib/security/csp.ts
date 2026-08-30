// `crypto`/`btoa` (não `Buffer`) porque isto roda no Proxy, que usa o Edge Runtime.
export function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

/**
 * `script-src` usa só nonce + `strict-dynamic` (sem `unsafe-inline`): os únicos
 * `<script>` inline da aplicação são JSON-LD (`type="application/ld+json"`), que a
 * própria CSP não regula por não ser um script executável.
 *
 * `style-src` mantém `unsafe-inline` de base para o atributo `style=""` usado em
 * componentes (CSP não tem como aplicar nonce a atributo), mas restringe elementos
 * `<style>` de verdade (`style-src-elem`) ao nonce — navegadores que entendem a
 * diretiva mais específica ignoram `unsafe-inline` quando um nonce está presente.
 */
export function buildContentSecurityPolicy(nonce: string, strapiPublicUrl: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    `style-src-elem 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: https:",
    `connect-src 'self' ${strapiPublicUrl}`,
    "font-src 'self' data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
