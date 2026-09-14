export const PERMISSIONS = {
  POST_TIKTOK: 'post:tiktok',
  POST_FACEBOOK: 'post:facebook',
  POST_INSTAGRAM: 'post:instagram',
  SHOPIFY_WRITE: 'shopify:write',
  AMAZON_WRITE: 'amazon:write',
  CANVA_WRITE: 'canva:write',
  INTERNET_READ: 'internet:read',
  MEMORY_WRITE: 'memory:write',
  VOICE_INPUT: 'voice:input',
  VOICE_OUTPUT: 'voice:output',
};

export function hasPermission(grantedPermissions = [], requiredPermission) {
  return grantedPermissions.includes(requiredPermission);
}

