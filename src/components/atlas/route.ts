import { routeTo, type Profile, type RouteStep } from '../../lib/graph/routes';
import type { AtlasData } from './atlasData';

/** Route steps for the atlas: the same tested algorithm used everywhere (src/lib/graph/routes.ts). */
export function routeSteps(_data: AtlasData, targets: string[], profile: Profile, completed: ReadonlySet<string>): RouteStep[] {
  return routeTo(targets, profile, completed);
}
