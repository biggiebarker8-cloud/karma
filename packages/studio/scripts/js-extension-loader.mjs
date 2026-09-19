export async function resolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch (error) {
    const isRelativeOrAbsolute =
      specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/');
    const hasKnownExtension = /\.[a-z0-9]+$/i.test(specifier);

    if (error?.code === 'ERR_MODULE_NOT_FOUND' && isRelativeOrAbsolute && !hasKnownExtension) {
      return defaultResolve(`${specifier}.js`, context, defaultResolve);
    }

    throw error;
  }
}
