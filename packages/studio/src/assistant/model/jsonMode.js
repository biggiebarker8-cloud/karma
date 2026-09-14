function validateValue(value, schema, path = 'root', errors = []) {
  if (!schema || typeof schema !== 'object') return errors;

  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push(`${path} must be an object`);
      return errors;
    }

    const required = schema.required || [];
    required.forEach((key) => {
      if (!(key in value)) {
        errors.push(`${path}.${key} is required`);
      }
    });

    const properties = schema.properties || {};
    Object.entries(properties).forEach(([key, propertySchema]) => {
      if (key in value) {
        validateValue(value[key], propertySchema, `${path}.${key}`, errors);
      }
    });
    return errors;
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path} must be an array`);
      return errors;
    }
    if (schema.items) {
      value.forEach((item, index) => {
        validateValue(item, schema.items, `${path}[${index}]`, errors);
      });
    }
    return errors;
  }

  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(`${path} must be a string`);
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    errors.push(`${path} must be a number`);
  }
  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${path} must be a boolean`);
  }

  return errors;
}

export function parseStrictJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

export function validateJsonSchema(value, schema) {
  const errors = validateValue(value, schema);
  return { valid: errors.length === 0, errors };
}

export function parseAndValidateJson(rawText, schema) {
  const parsed = parseStrictJson(rawText);
  const result = validateJsonSchema(parsed, schema);
  if (!result.valid) {
    throw new Error(`JSON schema validation failed: ${result.errors.join(', ')}`);
  }
  return parsed;
}

