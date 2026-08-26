<script lang="ts">
	import { page } from '$app/state';

	/** Friendlier copy for the statuses this app actually raises. */
	const headings: Record<number, string> = {
		403: 'Not yours to edit',
		404: 'Page not found',
		503: 'Recipe service unavailable'
	};

	let heading = $derived(headings[page.status] ?? 'Something went wrong');
</script>

<svelte:head>
	<title>{heading} · Recipe Finder</title>
</svelte:head>

<div class="page">
	<rk-empty-state
		icon={page.status === 404 ? '🧭' : '⚠️'}
		heading={heading}
		message={page.error?.message ?? 'Please try again in a moment.'}
	>
		<div class="row">
			<a class="btn btn--primary" href="/">Back to discover</a>
			<a class="btn btn--ghost" href="/favorites">My favourites</a>
		</div>
	</rk-empty-state>

	<p class="status muted">Error {page.status}</p>
</div>

<style>
	.status {
		margin-top: 1rem;
		font-size: 0.8rem;
		text-align: center;
	}
</style>
