/**
 * Stamp `dist/package.json` with this fork's publish identity.
 *
 * `build:lib` regenerates dist/package.json from the source manifest every
 * time, so the fork identity has to be re-applied after each build. Run:
 *
 *   bun run build:lib && node scripts/stamp-fork-publish.mjs && npm publish dist --access public
 *
 * Lives on `cline-fixes` only. The PR branch (fix/scrollbox-content-extent)
 * must not carry a private republishing script.
 *
 * Overridable: FORK_PKG_NAME, FORK_PKG_VERSION.
 */
import { readFileSync, writeFileSync } from "node:fs"

const NAME = process.env.FORK_PKG_NAME ?? "@logunovfgp/opentui-core"
const VERSION = process.env.FORK_PKG_VERSION ?? "0.4.3-scrollfix.1"
const MANIFEST = new URL("../dist/package.json", import.meta.url)

const pkg = JSON.parse(readFileSync(MANIFEST, "utf8"))

pkg.name = NAME
pkg.version = VERSION
pkg.description =
  "Fork of @opentui/core 0.4.3: ScrollBox sizes its bar from the content's real subtree extent (anomalyco/opentui#1500)."
pkg.repository = {
  type: "git",
  url: "git+https://github.com/logunovFGP/opentui.git",
  directory: "packages/core",
}
// Scoped packages publish restricted unless told otherwise, and npm
// refuses to publish a prerelease without a dist-tag ("You must specify a
// tag using --tag"). Carrying both here keeps `npm publish dist` a plain
// command and keeps the fork off the `latest` tag, where nothing should
// ever float to it by accident.
pkg.publishConfig = { access: "public", tag: "fork" }
// Keep upstream's peer dep. It is only stripped for the `file:` override,
// where a peer dep makes bun install two differently-hashed copies of the
// package; a registry install has no such problem, and dropping it here
// would silently change resolution versus upstream 0.4.3.
pkg.peerDependencies = { "web-tree-sitter": "0.25.10" }

writeFileSync(MANIFEST, `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`stamped dist/package.json as ${NAME}@${VERSION}`)
