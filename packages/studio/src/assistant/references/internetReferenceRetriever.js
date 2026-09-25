import { PERMISSIONS } from '../core/permissions.js';

function getDomain(urlString) {
  try {
    return new URL(urlString).hostname;
  } catch (_error) {
    return '';
  }
}

export function createInternetReferenceRetriever({
  fetchReferences,
  permissionChecker,
  allowlistDomains = [],
  requireCitation = true,
  auditLogger,
}) {
  return {
    async retrieve(query) {
      if (!permissionChecker(PERMISSIONS.INTERNET_READ)) {
        throw new Error('Internet reference permission denied');
      }

      const results = await fetchReferences(query);
      if (requireCitation && results.some((item) => !item?.url)) {
        throw new Error('All references must include a citation URL');
      }
      const filtered = results.filter((item) => {
        const domain = getDomain(item.url);
        if (!allowlistDomains.length) return true;
        return allowlistDomains.includes(domain);
      });

      auditLogger?.log?.({
        type: 'references.retrieved',
        query,
        resultCount: filtered.length,
      });

      return filtered;
    },
  };
}
