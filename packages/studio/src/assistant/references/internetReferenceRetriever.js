import { PERMISSIONS } from '../core/permissions.js';

function getDomain(urlString) {
  try {
    return new URL(urlString).hostname;
  } catch (_error) {
    return '';
  }
}

function isAllowedDomain(domain, allowlistDomains = []) {
  if (!allowlistDomains.length) {
    return true;
  }

  return allowlistDomains.some((allowedDomain) => {
    const normalizedAllowedDomain = String(allowedDomain || '').toLowerCase();
    const normalizedDomain = String(domain || '').toLowerCase();

    return (
      normalizedDomain === normalizedAllowedDomain ||
      normalizedDomain.endsWith(`.${normalizedAllowedDomain}`)
    );
  });
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
        return isAllowedDomain(domain, allowlistDomains);
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
