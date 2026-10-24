/** The lesson slug of the current page (/<base>/learn/<slug>/), or "page" elsewhere. */
export function lessonSlugFrom(pathname: string): string {
  const m = /\/learn\/([^/]+)\/?/.exec(pathname);
  return m ? m[1] : pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'page';
}
