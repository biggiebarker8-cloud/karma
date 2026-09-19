function includesAny(value, terms) {
  return terms.some((term) => value.includes(term));
}

export function detectDeviceProfile(userAgent = '') {
  const ua = userAgent.toLowerCase();

  if (!ua) return 'unknown';
  if (includesAny(ua, ['iphone', 'ipad', 'ipod'])) return 'ios';
  if (ua.includes('android')) return 'android';
  if (includesAny(ua, ['macintosh', 'mac os x'])) return 'macos';
  if (ua.includes('windows')) return 'windows';
  if (includesAny(ua, ['cros', 'chromebook'])) return 'chromeos';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

