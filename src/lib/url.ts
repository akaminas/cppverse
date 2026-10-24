// Internal URLs must include the deployment base path (/cppverse/ on GitHub
// Pages). Always build links with url() rather than hard-coding "/".
const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

export function url(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

export const lessonUrl = (slug: string, anchor?: string) => url(`/learn/${slug}/${anchor ? `#${anchor}` : ''}`);
export const atlasUrl = (node?: string) => url(`/atlas/${node ? `?node=${encodeURIComponent(node)}` : ''}`);
export const modelUrl = (id: string) => url(`/models/${id}/`);
export const capstoneUrl = (id: string) => url(`/capstones/${id}/`);
