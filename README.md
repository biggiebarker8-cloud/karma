# karma

## Try the assistant locally

Run:

`cd /home/runner/work/karma/karma/packages/studio && npm run try:assistant`

## Browser-only rendering

The studio package exposes `browser()` for components that must defer
rendering from SSR to the browser. Use the returned recoverable with React's
`use` inside a `<Suspense>` boundary:

```js
import { use, Suspense } from 'react';
import { browser } from '@karma/studio';

function BrowserOnly() {
  use(browser());
  return <ClientContent />;
}
```