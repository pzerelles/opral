---
imports: 
  - https://cdn.jsdelivr.net/npm/@opral/markdown-wc-doc-elements/dist/doc-features.js
  - https://cdn.jsdelivr.net/npm/@opral/markdown-wc-doc-elements/dist/doc-feature.js

---

![Typesafe, Small, SEO-Friendly and with a VSCode Extension.](./assets/og.png)

<doc-features>
<doc-feature text-color="#0F172A" color="#E1EFF7" title="Uses astro:i18n for routing" image="https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/packages/paraglide-astro/assets/use-astro-i18n.png"></doc-feature>
<doc-feature text-color="#0F172A" color="#E1EFF7" title="Tiny Bundle Size" image="https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/packages/paraglide-astro/assets/bundle-size.png"></doc-feature>
<doc-feature text-color="#0F172A" color="#E1EFF7" title="Only ships messages used on islands" image="https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/packages/paraglide-astro/assets/islands-only.png"></doc-feature>
</doc-features>

[![Inlang-ecosystem compatibility badge](https://cdn.jsdelivr.net/gh/opral/monorepo@main/inlang/assets/md-badges/inlang.svg)](https://inlang.com)

# Getting Started 

```bash
npx @inlang/paraglide-js@latest init
npm i @inlang/paraglide-astro
```

This will generate `messages/{locale}.json` files for each of your languages. 

Register the Integration in `astro.config.mjs`:

```js
import paraglideAstro from "@inlang/paraglide-astro"

export default {
	// Use astro's i18n routing for deciding which language to use
	i18n: {
		defaultLocale: "en",
		locales: ["en", "de"],
	},
	integrations: [
		paraglideAstro({
			project: "./project.inlang",
			outdir: "./src/paraglide",
		}),
	],
}
```

## Switching the language 

To switch the language, route to the language of interest. For example, to switch to German, route to `/de/page`.

```tsx
<a href="/page">Switch to en</a>
<a href="/de/page">Switch to de</a>
```

You can also use `setLocale` which will redirect the user to page in the given locale. Keep in mind that programmatically setting the locale will ship JS to the client and increase the bundle size.

```ts
import { setLocale } from "../paraglide/runtime.js"

setLocale("de")
```

# Usage

Refer to the Paraglide JS docs https://inlang.com/m/gerre34r/library-inlang-paraglideJs/getting-started.

## Understanding Locale Detection

Paraglide-Astro relies on [`astro:i18n`](https://docs.astro.build/en/guides/internationalization/)'s language detection. Place your page in a folder named for the language (or the `path` of the language) & all messages will be in that language.

```filesystem
src
├── pages
│   ├── en
│   │   ├── index.astro
│   │   └── about.astro
│   └── de
│       ├── index.astro
│       └── about.astro
```

If a page isn't in a language folder, it will use the default language.

```filesystem
src
├── pages
│   ├── index.astro // default language
│   ├── about.astro // default language
│   └── de
│       ├── index.astro // de
│       └── about.astro // de
```

You can configure which languages are available, and which is the default language in `project.inlang/settings.json`.

To save bundle size the integration doesn't ship language detection code to the client. Instead, it will read the `lang` attribute on the `<html>` tag. Make sure it is set correctly.

```astro
//src/layouts/default.astro
---
import { getLocale } from "$paraglide/runtime";
---

<!doctype html>
<html lang={getLocale()}>
    <slot />
</html>
---
```

## Linking between pages

Because pages in different languages often have different slugs there is no way to automatically generate links in all languages. You will need to define a custom function.

```ts
import type { AvailableLanguageTag } from "./paraglide/runtime.js"

type AbsolutePathname = `/${string}`

const pathnames : Record<AbsolutePathname, 
	Record<AvailableLanguageTag, AbsolutePathname>
> = {
	"/about": {
		en: "/about",
		de: "/de/ueber-uns",
	}
}

// src/linking.ts
export function localizePathname(
	pathname: AbsolutePathname, 
	locale: AvailableLanguageTag
) {
	if(pathnames[pathname]) {
		return pathnames[pathname][locale]
	}
	return pathname
}
```

Then use this function on your links

```tsx
<a href={localizePathname("/about", languageTag())}>{m.about()}</a>
```

## Adding Alternate Links

For SEO reasons, you should add alternate links to your page's head that point to all translations of the current page. Include the _current_ page. Make sure these are full HREFs, including the protocol and origin, not just the path.

```html
<head>
	<link rel="alternate" hreflang="en" href="https://acme.com/en/about" />
	<link rel="alternate" hreflang="de" href="https://acme.com/de/ueber-uns" />
</head>
```

Since only you know which pages correspond to each other this can't reliably be done automatically. Add these links manually.

# Migrating to v1 (beta)

1. Remove references of `Astro.locals.paraglide` from your code in favor of `getLocale()`. If you want to include the dir in the HTML, write your own function. 

```diff
---
+imports { getLocale } from "$paraglide/runtime.js"
---


<!doctype html>
-<html lang={Astro.locals.paraglide.locale} dir={Astro.locals.paraglide.dir}>
+<html lang={getLocale()}>
    <slot />
</html>
```
