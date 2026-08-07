/**
 * Blocks repository files from being served by Cloudflare Pages.
 *
 * This project has no build step, so its publish root is the repository root
 * and every committed file is fetchable over HTTPS. A `_redirects` file does
 * not help here: static assets take precedence over redirect rules, so a rule
 * pointing at a path that exists on disk is never applied. Pages Functions do
 * run ahead of static asset serving, so this middleware is what actually
 * closes the exposure.
 *
 * This is a mitigation, not the fix. It is a denylist, so any new
 * non-website file committed to the repository will be served unless it is
 * added below. The real fix is setting the Pages build command and output
 * directory so the publish root contains only built assets — at which point
 * this whole directory can be deleted.
 *
 * See docs/cloudflare-deployment-audit.md section 9.1.
 */

const BLOCKED = [
  /^\/docs(\/|$)/i,
  /^\/\.github(\/|$)/i,
  /^\/\.git(\/|$)/i,
  /^\/LICENSE$/i,
  /^\/SECURITY\.md$/i,
  /^\/README\.md$/i,
  /^\/\.gitignore$/i,
];

export async function onRequest(context) {
  const { request, next } = context;
  const { pathname } = new URL(request.url);

  if (!BLOCKED.some((pattern) => pattern.test(pathname))) {
    return next();
  }

  // Serve the site's own 404 page so blocked paths are indistinguishable
  // from paths that simply do not exist.
  try {
    const notFound = await next(
      new Request(new URL("/404.html", request.url), { method: "GET" }),
    );
    return new Response(notFound.body, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
