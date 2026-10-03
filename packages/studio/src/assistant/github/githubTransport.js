const DEFAULT_ENDPOINT = 'https://api.github.com';

function encodePathSegment(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`GitHub request requires ${name}`);
  }
  return encodeURIComponent(value.trim());
}

export function createGitHubTransport({
  token = process.env.GITHUB_TOKEN,
  fetchImpl = globalThis.fetch,
  endpoint = DEFAULT_ENDPOINT,
  allowedRepositories = process.env.GITHUB_ALLOWED_REPOSITORIES?.split(',') ?? [],
} = {}) {
  if (!token) {
    throw new Error('GitHub transport requires GITHUB_TOKEN');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('GitHub transport requires fetch');
  }
  const repositoryAllowlist = new Set(
    allowedRepositories
      .filter((repository) => typeof repository === 'string')
      .map((repository) => repository.trim().toLowerCase())
      .filter(Boolean),
  );

  return async function request({
    owner,
    repo,
    path,
    query = {},
    globalPath = false,
  }) {
    const repository = `${owner}/${repo}`.toLowerCase();
    if (!repositoryAllowlist.has(repository)) {
      throw new Error('GitHub request denied: repository is not allowlisted');
    }

    const url = new URL(globalPath ? path : `/repos/${encodePathSegment(owner, 'owner')}/${encodePathSegment(repo, 'repo')}${path || ''}`, endpoint);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });

    const response = await fetchImpl(url, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: 'Bearer ' + token,
        'x-github-api-version': '2022-11-28',
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub request failed with status ${response.status}`);
    }
    return response.json();
  };
}
