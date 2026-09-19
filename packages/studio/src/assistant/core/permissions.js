export const PERMISSIONS = {
  OPENCLAW_MANAGE: 'openclaw:manage',
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
  IMAGE_READ: 'image:read',
  DESIGN_HOODIE: 'design:hoodie',
  DESIGN_COMICS: 'design:comics',
  EDIT_MOVIE_CLIPS: 'edit:movie-clips',
  INSTALL_GUIDE_READ: 'install-guide:read',
};

export function hasPermission(grantedPermissions = [], requiredPermission) {
  return grantedPermissions.includes(requiredPermission);
}
