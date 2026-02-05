# ngx-segment-community

[![npm version](https://img.shields.io/npm/v/ngx-segment-community.svg)](https://www.npmjs.com/package/ngx-segment-community)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**The community-maintained successor to
[ngx-segment-analytics](https://github.com/opendecide/ngx-segment-analytics).**
This library updates the original codebase to support Angular 20+ (including
v21+) while preserving the exact same API.

## 📦 Installation

```bash
npm install ngx-segment-community
```

## 🔄 Migration from `ngx-segment-analytics`

If you are upgrading from the abandoned `ngx-segment-analytics` package, the
process is a simple drop-in replacement.

1. **Uninstall the old library:**

```bash
npm uninstall ngx-segment-analytics

```

2. **Install the new library:**

```bash
npm install ngx-segment-community

```

3. **Update your imports:** Perform a global find-and-replace in your IDE:

- Find: `from 'ngx-segment-analytics'`
- Replace: `from 'ngx-segment-community'`

## 🚀 Usage

The API is identical to the original library.

### 1. Import the Module

In your `app.config.ts` (or `app.module.ts`):

```ts
import { SegmentModule } from "ngx-segment-community";

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      SegmentModule.forRoot({
        apiKey: "YOUR_SEGMENT_WRITE_KEY",
      }),
    ),
  ],
};
```

### 2. Track Events

Inject `SegmentService` into your components:

```ts
import { Component, inject } from '@angular/core';
import { SegmentService } from 'ngx-segment-community';

@Component({ ... })
export class AppComponent {
  private segment = inject(SegmentService);

  trackUser() {
    this.segment.track('Button Clicked', {
      button_name: 'signup_header'
    });
  }
}

```

## 📄 License

MIT © [Behnam Sajadifar] (Based on work by OpenDecide)
