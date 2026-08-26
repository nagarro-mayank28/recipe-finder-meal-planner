<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	// Design tokens published by the component library, so the app chrome and the
	// web components share one palette.
	import '@mayank_singh28/recipe-ui-kit/tokens.css';
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import { defineRecipeUiKit } from '$lib/stencil/define';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { mealPlan } from '$lib/stores/mealPlan.svelte';

	let { children } = $props();

	// Register the custom elements once, after the first client-side render.
	onMount(() => {
		defineRecipeUiKit();
	});

	const links = [
		{ href: '/', label: 'Discover' },
		{ href: '/favorites', label: 'Favourites' },
		{ href: '/my-recipes', label: 'My recipes' },
		{ href: '/planner', label: 'Planner' }
	];

	/** Highlight `/` only on the exact route; other links also match child pages. */
	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return href === '/' ? path === '/' : path.startsWith(href);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="header">
	<div class="header-inner">
		<a class="brand" href="/">
			<span class="brand-mark" aria-hidden="true">🍲</span>
			<span class="brand-text">
				<strong>Recipe Finder</strong>
				<span class="brand-sub">&amp; Meal Planner</span>
			</span>
		</a>

		<nav aria-label="Main">
			<ul class="nav">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							class="nav-link"
							class:nav-link--active={isActive(link.href)}
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							{link.label}

							<!--
								Counts read straight from the runes stores, so they stay live as
								the user favourites recipes or fills the week.
							-->
							{#if link.href === '/favorites' && favorites.count > 0}
								<span class="count">{favorites.count}</span>
							{:else if link.href === '/planner' && mealPlan.plannedCount > 0}
								<span class="count">{mealPlan.plannedCount}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<main>
	{@render children()}
</main>

<footer class="footer">
	<p>
		Recipe data from
		<a class="link" href="https://www.themealdb.com" target="_blank" rel="noreferrer noopener">
			TheMealDB
		</a>
		· UI components from
		<a
			class="link"
			href="https://www.npmjs.com/package/@mayank_singh28/recipe-ui-kit"
			target="_blank"
			rel="noreferrer noopener"
		>
			@mayank_singh28/recipe-ui-kit
		</a>
	</p>
</footer>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: color-mix(in srgb, var(--rk-color-surface) 88%, transparent);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--rk-color-border);
	}

	.header-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: min(72rem, 100% - 2rem);
		margin: 0 auto;
		padding: 0.85rem 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
	}

	.brand-mark {
		font-size: 1.5rem;
		line-height: 1;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}

	.brand-text strong {
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	.brand-sub {
		font-size: 0.7rem;
		color: var(--rk-color-muted);
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.8rem;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--rk-color-muted);
		border-radius: var(--rk-radius-pill);
	}

	.nav-link:hover {
		color: var(--rk-color-text);
		background: var(--rk-color-surface-alt);
	}

	.nav-link--active {
		color: var(--rk-color-primary);
		background: var(--rk-color-primary-soft);
	}

	.nav-link:focus-visible {
		outline: none;
		box-shadow: var(--rk-focus-ring);
	}

	.count {
		display: inline-grid;
		place-items: center;
		min-width: 1.3rem;
		height: 1.3rem;
		padding: 0 0.3rem;
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		color: var(--rk-color-on-primary);
		background: var(--rk-color-primary);
		border-radius: var(--rk-radius-pill);
	}

	.footer {
		padding: 2rem 1rem 2.5rem;
		font-size: 0.82rem;
		text-align: center;
		color: var(--rk-color-muted);
		border-top: 1px solid var(--rk-color-border);
	}

	.link {
		color: var(--rk-color-primary);
		font-weight: 600;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
