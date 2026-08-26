import type { PageLoad } from './$types';

/**
 * Favourites live only in `localStorage`, which the server cannot read. Without
 * this the server would render "no favourites yet" and the client would swap in
 * the real list a moment later - a visible flash of wrong content.
 */
export const ssr = false;

export const load: PageLoad = () => ({});
