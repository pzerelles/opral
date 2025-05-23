import { test, expect } from "vitest";
import { createParaglide } from "../create-paraglide.js";
import { newProject } from "@inlang/sdk";

test("normal named groups", async () => {
	const runtime = await createParaglide({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de"],
			},
		}),
		urlPatterns: [
			{
				pattern: "https://example.com/bookstore/item/:id",
				localized: [
					["de", "https://example.com/buchladen/artikel/:id"],
					["en", "https://example.com/bookstore/item/:id"],
				],
			},
		],
	});

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/bookstore/item/123`)
	).toBe("en");

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/buchladen/artikel/123`)
	).toBe("de");

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/something/else`)
	).toBe(undefined);
});

test("handles relative named groups", async () => {
	const runtime = await createParaglide({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de"],
			},
		}),
		urlPatterns: [
			{
				pattern: "/bookstore/item/:id",
				localized: [
					["de", "/buchladen/artikel/:id"],
					["en", "/bookstore/item/:id"],
				],
			},
		],
	});

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/bookstore/item/123`)
	).toBe("en");

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/buchladen/artikel/123`)
	).toBe("de");

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/something/else`)
	).toBe(undefined);
});

test("wildcards", async () => {
	const runtime = await createParaglide({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de"],
			},
		}),
		urlPatterns: [
			{
				pattern: "https://{:subdomain.}?:domain.:tld/:path*",
				localized: [
					["de", "https://de.:domain.:tld/startseite/ueber-uns"],
					["en", "https://:domain.:tld/home/about-us"],
				],
			},
		],
	});

	expect(
		runtime.extractLocaleFromUrl(`https://de.example.com/startseite/ueber-uns`)
	).toBe("de");

	expect(
		runtime.extractLocaleFromUrl(`https://example.com/home/about-us`)
	).toBe("en");
});

test("optional parameters", async () => {
	const runtime = await createParaglide({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de"],
			},
		}),
		urlPatterns: [
			{
				pattern: "https://example.com/:locale?",
				localized: [
					["de", "https://example.com/de"],
					["en", "https://example.com/en"],
				],
			},
		],
	});

	expect(runtime.extractLocaleFromUrl(`https://example.com/de`)).toBe("de");
	expect(runtime.extractLocaleFromUrl(`https://example.com/en`)).toBe("en");
});

test("regex works", async () => {
	const { extractLocaleFromUrl } = await createParaglide({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de"],
			},
		}),
		urlPatterns: [
			{
				pattern: "https://example.com/:item(phone)",
				localized: [
					["en", "https://example.com/:item(phone)"],
					["de", "https://example.com/de/:item(phone)"],
				],
			},
		],
	});

	expect(extractLocaleFromUrl(`https://example.com/de/phone`)).toBe("de");
	expect(extractLocaleFromUrl(`https://example.com/phone`)).toBe("en");

	expect(extractLocaleFromUrl(`https://example.com/de/other`)).toBe(undefined);
	expect(extractLocaleFromUrl(`https://example.com/other`)).toBe(undefined);
});

test("default url pattern", async () => {
	const r = await createParaglide({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de"],
			},
		}),
	});

	expect(r.extractLocaleFromUrl("https://example.com/")).toBe("en");
	expect(r.extractLocaleFromUrl("https://example.com/de")).toBe("de");
	expect(r.extractLocaleFromUrl("https://example.com/fr")).toBe("en");

	expect(r.extractLocaleFromUrl("https://example.com/optional-subpage")).toBe(
		"en"
	);
	expect(
		r.extractLocaleFromUrl("https://example.com/de/optional-subpage")
	).toBe("de");
});
