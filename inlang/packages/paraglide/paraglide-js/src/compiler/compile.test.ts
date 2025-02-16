import {
	loadProjectInMemory,
	newProject,
	saveProjectToDirectory,
} from "@inlang/sdk";
import { memfs } from "memfs";
import { test, expect, vi } from "vitest";
import { compile, type Adapter } from "./compile.js";
import { getAccountFilePath } from "../services/account/index.js";

test("loads a project and compiles it", async () => {
	const project = await loadProjectInMemory({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de", "fr"],
			},
		}),
	});

	const fs = memfs().fs as unknown as typeof import("node:fs");

	// save project to directory to test loading
	await saveProjectToDirectory({
		project,
		path: "/project.inlang",
		fs: fs.promises,
	});

	await compile({
		project: "/project.inlang",
		outdir: "/output",
		fs: fs,
	});

	const files = await fs.promises.readdir("/output");

	//runtime.js and messages.js are always compiled with the default options
	expect(files).toEqual(expect.arrayContaining(["runtime.js", "messages.js"]));
});

test("loads a local account from app data if exists", async () => {
	const accountPath = getAccountFilePath();
	const fs = memfs({
		[accountPath]: JSON.stringify({ id: "mock", name: "test" }),
	}).fs as unknown as typeof import("node:fs");

	const spy = vi.spyOn(fs, "readFileSync");

	const project = await loadProjectInMemory({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de", "fr"],
			},
		}),
	});

	await saveProjectToDirectory({
		project,
		path: "/project.inlang",
		fs: fs.promises,
	});

	await compile({
		project: "/project.inlang",
		outdir: "/output",
		fs: fs,
	});

	expect(spy).toHaveBeenCalledWith(accountPath, "utf8");
});

test("saves the local account to app data if not exists", async () => {
	const accountPath = getAccountFilePath();
	const fs = memfs().fs as unknown as typeof import("node:fs");

	const project = await loadProjectInMemory({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de", "fr"],
			},
		}),
	});

	await saveProjectToDirectory({
		project,
		path: "/project.inlang",
		fs: fs.promises,
	});

	await compile({
		project: "/project.inlang",
		outdir: "/output",
		fs: fs,
	});

	const account = JSON.parse(await fs.promises.readFile(accountPath, "utf8"));

	expect(account).toHaveProperty("id");
	expect(account).toHaveProperty("name");
});

test("cleans the output directory", async () => {
	const fs = memfs().fs as unknown as typeof import("node:fs");

	const project = await loadProjectInMemory({
		blob: await newProject({}),
	});

	// save project to directory to test loading
	await saveProjectToDirectory({
		project,
		path: "/project.inlang",
		fs: fs.promises,
	});

	await fs.promises.mkdir("/output/subdir", { recursive: true });
	await fs.promises.writeFile("/output/subdir/x.js", "console.log('hello')");
	await fs.promises.writeFile("/output/y.js", "console.log('hello')");

	await compile({
		project: "/project.inlang",
		outdir: "/output",
		fs: fs,
	});

	const outputDir = await fs.promises.readdir("/output");
	const outputSubDir = fs.existsSync("/output/subdir");

	expect(outputDir).not.toContain("y.js");
	expect(outputSubDir).toBe(false);
});

test("multiple compile calls do not interfere with each other", async () => {
	const fs = memfs().fs as unknown as typeof import("node:fs");

	const project = await loadProjectInMemory({
		blob: await newProject({}),
	});

	await saveProjectToDirectory({
		project,
		path: "/project.inlang",
		fs: fs.promises,
	});

	const compilations = [
		compile({
			project: "/project.inlang",
			outdir: "/output/subdir",
			fs: fs,
		}),
		compile({
			project: "/project.inlang",
			outdir: "/output",
			fs: fs,
		}),
	];

	await Promise.all(compilations);

	const outputDir = await fs.promises.readdir("/output");

	expect(outputDir).not.toContain("subdir");
});

test("emits files of an adapter", async () => {
	const adapter: Adapter = {
		files: {
			"adapter/component.svelte": "<script>console.log('hello')</script>",
			"adapter.js": "console.log('hello')",
		},
	};

	const project = await loadProjectInMemory({
		blob: await newProject({
			settings: {
				baseLocale: "en",
				locales: ["en", "de", "fr"],
			},
		}),
	});

	const fs = memfs().fs as unknown as typeof import("node:fs");

	// save project to directory to test loading
	await saveProjectToDirectory({
		project,
		path: "/project.inlang",
		fs: fs.promises,
	});

	await compile({
		project: "/project.inlang",
		outdir: "/output",
		fs: fs,
		adapter,
	});

	const outputDir = await fs.promises.readdir("/output");
	const adapterDir = await fs.promises.readdir("/output/adapter");

	expect(outputDir).toEqual(
		expect.arrayContaining(["runtime.js", "messages.js", "adapter.js"])
	);

	expect(adapterDir).toEqual(["component.svelte"]);
});
