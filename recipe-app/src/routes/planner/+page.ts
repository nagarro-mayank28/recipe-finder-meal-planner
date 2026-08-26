import type { PageLoad } from './$types';

/** The plan is stored in the browser, so there is nothing to render on the server. */
export const ssr = false;

export const load: PageLoad = () => ({});
