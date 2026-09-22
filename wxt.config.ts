import { defineConfig } from "wxt"

// Public key of the Chrome Web Store item. It pins the extension ID so unpacked
// builds share storage with the store install. The store assigns this key and
// rejects a first upload that already carries one, so it stays unset until the
// item exists. Edge Add-ons assigns its own ID, so Edge builds never carry it.
const chromeExtensionKey: string | undefined = undefined

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  imports: false,
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    ...(browser === "chrome" && chromeExtensionKey ? { key: chromeExtensionKey } : {}),
    permissions: [
      "storage",
      "tabs",
      "alarms",
      "scripting",
      "webNavigation",
    ],
    host_permissions: [
      "*://*/*", // Required for scripting.executeScript in any frame
    ],
    // Allow images/SVGs referenced by content-script UI <img> tags to be loaded from
    // moz-extension:// URLs on regular pages. Firefox enforces this more strictly.
    web_accessible_resources: [
      {
        resources: ["assets/*.png", "assets/*.svg", "assets/*.webp"],
        matches: ["*://*/*", "file:///*"],
      },
    ],
    // Firefox-specific settings for MV3
    ...(browser === "firefox" && {
      // Override default CSP to exclude `upgrade-insecure-requests` (Firefox MV3 default),
      // which would upgrade custom provider HTTP URLs (e.g. LAN) to HTTPS.
      content_security_policy: {
        extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
      },
      browser_specific_settings: {
        gecko: {
          id: "plainly@xuanwo.io",
          // Firefox 140 is the first release that shows data_collection_permissions
          // in the install prompt; older releases would need an in-extension consent UI.
          strict_min_version: "140.0",
          // Page text is sent to the model provider the user configures.
          data_collection_permissions: {
            required: ["websiteContent"],
          },
        },
        // Firefox for Android shows data_collection_permissions from 142 on.
        gecko_android: {
          strict_min_version: "142.0",
        },
      },
    }),
  }),
  zip: {
    excludeSources: ["docs/**/*", "assets/**/*", "repos/**/*"],
  },
  dev: {
    server: {
      // Prefer 3333 over WXT's default 3000 while still allowing WXT to pick
      // another open port when 3333 is already taken.
      port: 3333,
      strictPort: false,
    },
  },
  vite: () => ({
    plugins: [],
  }),
})
