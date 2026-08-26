import type { PageLoad } from './$types';

/** User recipes are stored in the browser, so there is nothing to render on the server. */
export const ssr = false;

export const load: PageLoad = () => ({});
