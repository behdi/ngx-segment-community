# ngx-segment-community

[![npm version](https://img.shields.io/npm/v/ngx-segment-community.svg)](https://www.npmjs.com/package/ngx-segment-community)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A standalone-first Angular wrapper for Segment Analytics. Built for modern
Angular (17+), it provides a first-class, reactive wrapper around Segment's
browser tracking API.

It deeply integrates with Angular's Dependency Injection system, allowing you to
seamlessly mutate tracking payloads using your own application state and
services. It also features a highly advanced automatic page-tracking engine,
battle-tested against complex Angular routing mechanics.

> ⚠️ **Are you upgrading an older application?** If you are looking for the
> legacy `SegmentModule.forRoot()` implementation as a drop-in replacement for
> the abandoned `ngx-segment-analytics` package, please install version `1.x.x`
> and
> [read the legacy documentation here](https://github.com/behdi/ngx-segment-community/tree/v1.x.x).

---

## 📦 Installation

```bash
npm install ngx-segment-community
```

---

## 🚀 Quick Start

### 1. Configuration (`app.config.ts`)

```ts
import { ApplicationConfig } from "@angular/core";
import { provideSegmentAnalytics } from "ngx-segment-community";
import { withAutomaticPageTracking } from "ngx-segment-community/utils";

export const appConfig: ApplicationConfig = {
  providers: [
    provideSegmentAnalytics(
      {
        writeKey: "YOUR_SEGMENT_WRITE_KEY",
        debug: true, // Optional: Logs helpful messages to the console
      },
      withAutomaticPageTracking(), // Optional: Enables the routing engine
    ),
  ],
};
```

### 2. Basic Tracking

Inject `SegmentService` to track events, identify users, and tie them to groups.
The service exposes a reactive `initialized` Signal so your UI can safely wait
for the browser instance to boot.

```ts
import { Component, effect, inject } from "@angular/core";
import { SegmentService } from "ngx-segment-community";

@Component({
  selector: "app-checkout",
  template: `<button (click)="onCheckout()">Checkout</button>`,
})
export class CheckoutComponent {
  private readonly _segment = inject(SegmentService);

  constructor() {
    // Safely react to Segment's readiness using Signals
    effect(() => {
      if (this._segment.initialized()) {
        console.log("Segment is ready to track!");
      }
    });
  }

  onCheckout() {
    this._segment.track("Order Completed", {
      revenue: 99.99,
      currency: "USD",
    });
  }
}
```

---

## 🧠 Advanced: DI-Powered Middlewares & Plugins

Segment's native source middlewares allow you to manipulate payloads _before_
they hit the network. **Because this library runs your middleware factories
inside an Angular Injection Context, you can safely use `inject()` to grab your
internal services.**

Here is an example of injecting an `AuthService` to dynamically redact
Personally Identifiable Information (PII):

```ts
import { inject } from "@angular/core";
import { AuthService } from "./core/auth.service";
import { SegmentSourceMiddlewareFn } from "ngx-segment-community";

// 1. Define the factory
export const piiRedactionMiddleware: SegmentSourceMiddlewareFn = () => {
  // 💥 Safely inject any Angular service from the root tree!
  const authService = inject(AuthService);

  return ({ payload, next }) => {
    // Mutate the Segment payload using your local application state
    if (authService.isLoggedIn()) {
      payload.obj.userId = authService.hashedUserId();
    }
    next(payload);
  };
};
```

```ts
// 2. Register it in app.config.ts
import { withSourceMiddlewares } from "ngx-segment-community";

export const appConfig: ApplicationConfig = {
  providers: [
    provideSegmentAnalytics(
      { writeKey: "YOUR_SEGMENT_WRITE_KEY" },
      withSourceMiddlewares([piiRedactionMiddleware]),
    ),
  ],
};
```

This same pattern applies to `withPlugins()` and `withDestinationMiddlewares()`.

---

## 🛣️ Auto Page Tracking

Tired of manually calling `segment.page()` on every route? Enable
`withAutomaticPageTracking()` in your providers. This configures the library to
automatically listen to Angular's `NavigationEnd` events and track page views.
By default, it uses the native Angular route `title`.

To pass custom Segment categories, names, and properties, attach a
`SegmentRouterData` instance to your route's `data` object.

### Custom Route Tracking

```typescript
import { Routes } from "@angular/router";
import { SegmentRouterData } from "ngx-segment-community/utils";

export const routes: Routes = [
  {
    path: "store",
    component: StoreComponent,
    data: {
      // payload: page('Storefront', 'Product List', { category: 'Shoes' })
      segment: new SegmentRouterData("Storefront", "Product List", {
        category: "Shoes",
      }),
    },
  },
];
```

### The Tracking Kill Switch

Sometimes you have utility routes (like an admin panel, or a componentless
wrapper) that should _not_ trigger a page view. Use `SegmentRouterIgnore` to
silence the tracker.

```ts
import { Routes } from "@angular/router";
import { SegmentRouterIgnore } from "ngx-segment-community/utils";

export const routes: Routes = [
  {
    path: "health-check",
    component: HealthComponent,
    data: {
      // Silences tracking for this specific leaf route
      ignore: new SegmentRouterIgnore(),
    },
  },
  {
    path: "admin",
    component: AdminLayoutComponent,
    data: {
      // Silences tracking for the parent AND all child routes dynamically
      ignore: new SegmentRouterIgnore({ cascade: true }),
    },
    children: [
      { path: "dashboard", component: DashboardComponent }, // Will not be tracked
    ],
  },
];
```

> **Advanced Note on Resolvers:** The automatic tracker fully supports Angular
> `ResolveFn`. You can dynamically return `SegmentRouterData` or
> `SegmentRouterIgnore` from a resolver, and the tracker will correctly process
> it before firing the event.

---

## 📄 API Surface

The `SegmentService` fully implements the modern `@segment/analytics-next`
wrapper, plus native Angular Signals:

- `initialized()` _(Angular Signal)_
- `track(eventName, properties?)`
- `identify(userId, traits?)`
- `page(categoryOrName, name?, properties?)`
- `group(groupId, traits?)`
- `alias(userId, previousId?)`
- `trackLink(element, eventName, properties?)`
- `reset()`
- `whenReady(callback)`

## 📄 License

MIT © Behnam Sajadifar
