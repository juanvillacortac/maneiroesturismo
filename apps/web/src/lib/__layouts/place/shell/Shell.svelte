<script>
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import Feed from '$lib/feed/Feed.svelte'
  import Logo from '$lib/Logo.svelte'
  import { getAbsoluteURL } from '$lib/utils/host'
  import { fade } from 'svelte/transition'
  import Header from './Header.svelte'

  let headerHeight = 0
</script>

<div
  class="flex flex-col min-h-screen w-full justify-between"
  style:--header-height="{headerHeight}px"
>
  {#if !$page.url.pathname.startsWith('/login')}
    <Header bind:headerHeight />
  {/if}
  {#if $page.data.showFeed}
    <div
      class="flex-grow flex flex-col h-full"
      in:fade|local={{ duration: 200 }}
    >
      <Feed
        post={$page.data.post || null}
        on:closePostModal={() => {
          goto('/', { noScroll: true })
        }}
      />
    </div>
  {:else}
    {#key $page.route.id}
      <div
        class="flex-grow flex flex-col h-full"
        in:fade|local={{ duration: 200 }}
      >
        <slot />
      </div>
    {/key}
  {/if}
  {#if !$page.url.pathname.startsWith('/login')}
    <div class="flex flex-col w-full py-8 items-center">
      <div class="flex flex-col space-y-2 text-center items-center">
        <span class="font-bold text-xs">A través de</span>
        <a
          href={getAbsoluteURL({
            subdomain: 'app',
          })}
          class="transform transition-transform duration-200 hover:scale-95"
          style="will-change: transform"
          target="_blank"
        >
          <Logo anim={false} />
        </a>
        <span class="text-xs"
          >Todos los derechos reservados, {new Date().getFullYear()} &copy;</span
        >
      </div>
    </div>
  {/if}
</div>
