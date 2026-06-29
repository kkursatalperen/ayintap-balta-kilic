export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /profil

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
