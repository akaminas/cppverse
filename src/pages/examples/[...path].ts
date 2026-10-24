// Publishes every file in /cpp-examples as a static download
// (e.g. /cppverse/examples/foundations/hello.cpp).
import type { APIRoute, GetStaticPaths } from 'astro';
import { allExampleFiles, rawExampleFile } from '../../lib/examples';

export const getStaticPaths: GetStaticPaths = () => allExampleFiles().map((path) => ({ params: { path } }));

export const GET: APIRoute = ({ params }) => {
  const body = rawExampleFile(params.path!);
  if (body === undefined) return new Response('Not found', { status: 404 });
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
