# ngx-segment-community

[![npm version](https://img.shields.io/npm/v/ngx-segment-community.svg)](https://www.npmjs.com/package/ngx-segment-community)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**The modern, community-maintained Angular wrapper for Segment Analytics
(`@segment/analytics-next`).**

This repository houses the enterprise-grade Angular integration for Segment.
Built from the ground up for modern Angular (v20+), it leverages Standalone
APIs, Dependency Injection closures, and Signals to provide a flawless, reactive
tracking experience.

---

## 🚦 Versioning & Branching Strategy

This repository maintains two distinct architectural versions to support the
Angular community safely:

### 🌟 Current (v2.x.x / `master` branch)

The modern architecture. Completely rewritten to support the Standalone API and
dependency injection for Segment Plugins and Middlewares, along with a lot of
unit tests.

- **If you are starting a new project or migrating an app off `NgModules`, use
  this version.**
- Read the
  [Full v2 Documentation here](./projects/ngx-segment-community/README.md)

### 🏛️ Legacy `NgModule` (v1.x.x / `v1.x.x` branch)

A direct fork and drop-in replacement for the abandoned `ngx-segment-analytics`
library. It uses the traditional `SegmentModule.forRoot()` pattern.

- **If you have a legacy Angular application and just need to quickly swap out
  the abandoned package without refactoring your codebase, use this version.**
- [View the v1.x.x documentation and codebase here](https://github.com/behdi/ngx-segment-community/tree/v1.x.x).

---

## ✨ Features (v2 Architecture)

- **Standalone First:** No more `NgModules`. Configured entirely via
  `provideSegmentAnalytics()`.
- **DI-Powered Middlewares & Plugins:** Safely use Angular's `inject()` inside
  your Segment Middlewares/PLugins to access state (e.g., Redacting PII using an
  injected `AuthService` before payloads hit the network).
- **Signal Integration:** Exposes a reactive `initialized` Signal to easily
  track when the Segment browser instance is ready.
- **Strictly Typed:** Full TypeScript support for the entire
  `@segment/analytics-next` API surface.
- **Auto-Router Tracking:** Includes an optional global router tracker to
  automatically fire `.page()` events on successful navigation, correctly
  handling complex router state trees.
- **Unit Tests:** Every single API surface has been fully covered with unit
  tests.

---

## 🚀 Quick Peek (v2)

For full installation and advanced DI usage, please see the
[Library README](./projects/ngx-segment-community/README.md).

```ts
import { provideSegmentAnalytics, withPlugins } from "ngx-segment-community";

export const appConfig: ApplicationConfig = {
  providers: [
    provideSegmentAnalytics(
      { writeKey: "YOUR_SEGMENT_WRITE_KEY" },
      withPlugins([myCustomPluginFactory]),
    ),
  ],
};
```

---

## 🛠️ Local Development & The Testing Playground

Because this library bridges Angular's Dependency Injection with asynchronous
browser APIs, standard unit tests aren't always enough to visualize the data
flow.

This repository includes a fully functional Angular **Playground** application.
It acts as a visual testing laboratory to prove that Segment successfully
intercepts events, injects Angular services, and manipulates payloads before
they hit the network.

### Running the Playground Locally

1. **Clone the repository:**

```bash
git clone https://github.com/behdi/ngx-segment-community.git
cd ngx-segment-community

```

2. **Install dependencies:**

```bash
npm install

```

3. **Run the Playground app:**

```bash
npm run start

```

4. **Experiment:** Open `http://localhost:4200`. The playground features a live
   "Event Feed" sidebar that intercepts and displays your Segment payloads in
   real-time without needing to view them on actual Segment workspace.

---

## 🤝 Contributing

We welcome pull requests! If you are adding a new feature or fixing a bug,
please ensure that:

1. You write unit tests for your changes.
2. You test your changes visually in the Playground application.
3. You adhere to the existing strict TypeScript configurations.

## 📄 License

MIT © Behnam Sajadifar
