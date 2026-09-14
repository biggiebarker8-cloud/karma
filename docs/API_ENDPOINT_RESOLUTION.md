# API Endpoint Resolution for Cross-Platform Support

## Problem

The Studio application runs in two different contexts:

1. **Web (HTTP/HTTPS)**: Served by Next.js
   - API calls use relative paths: `/api/...`
   - These are routed through the Next.js proxy to the backend

2. **Desktop (Electron)**: Loaded via `file://`
   - Relative paths `/api/...` have no valid origin
   - Fetch requests to `/api/...` fail silently
   - Price badges and other API-dependent features don't work

## Solution

The `apiResolver.js` utility detects the runtime context and routes API calls appropriately:

- **HTTP/HTTPS context**: Uses relative paths (existing Next.js routing)
- **file:// context**: Uses absolute URLs to `https://api.muapi.ai`

## Implementation

### 1. Create `packages/studio/src/utils/apiResolver.js`

```javascript
export function resolveApiEndpoint(path) {
  if (typeof window === 'undefined') {
    return path; // SSR context
  }

  const isFileProtocol = window.location.protocol === 'file:';

  if (isFileProtocol) {
    // Electron: use absolute URL
    return `https://api.muapi.ai${path}`;
  }

  // Web: use relative path
  return path;
}
```

### 2. Use in API modules

**muapiPricing.js:**
```javascript
import { resolveApiEndpoint } from './apiResolver';

export async function getMuapiPriceMap() {
  const endpoint = resolveApiEndpoint('/api/app/get_homepage_models');
  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}
```

**muapi.js:**
```javascript
import { resolveApiEndpoint } from './utils/apiResolver';

export async function muapiFetch(path, options = {}) {
  const endpoint = resolveApiEndpoint(path);
  return fetch(endpoint, { credentials: 'include', ...options });
}
```

### 3. Use in components

**ImageStudio.jsx / VideoStudio.jsx:**
```javascript
import { getMuapiPriceMap } from '../utils/muapiPricing';

useEffect(() => {
  const loadPricing = async () => {
    try {
      const prices = await getMuapiPriceMap();
      setPriceMap(prices);
    } catch (err) {
      setError(err.message);
    }
  };
  loadPricing();
}, []);
```

## How It Works

### Web Context (HTTP)
```
User → Next.js (http://localhost:3000)
  ↓
resolveApiEndpoint('/api/models') → '/api/models'
  ↓
fetch('/api/models')
  ↓
Next.js routes to backend
  ↓
Backend API
```

### Desktop Context (file://)
```
User → Electron App (file:///app/index.html)
  ↓
resolveApiEndpoint('/api/models') → 'https://api.muapi.ai/api/models'
  ↓
fetch('https://api.muapi.ai/api/models')
  ↓
Direct to backend API
```

## Key Benefits

✅ **Single codebase**: No duplicate API logic
✅ **Automatic detection**: No configuration needed
✅ **Fallback-safe**: Price badges gracefully degrade if API fails
✅ **Maintainable**: One utility handles all endpoint resolution
✅ **Extensible**: Easy to add more context-aware logic

## Testing

### Web Context
```bash
npm start  # Runs on http://localhost:3000
# Price badges should display
```

### Desktop Context
```bash
npm run build
npm run electron
# Price badges should display in Electron app
```

## Future Enhancements

- [ ] Add retry logic for failed API calls
- [ ] Cache API responses in Electron
- [ ] Add offline mode support
- [ ] Implement CORS-proxy alternative if needed
