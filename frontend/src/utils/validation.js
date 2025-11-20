/**
 * Minimal validation utilities. Keep messages human, not technical.
 */

export const validateRequired = (value, message = 'This field is required') => {
  if (value == null) return message;
  if (typeof value === 'string' && value.trim() === '') return message;
  return null;
};

export const validateHabit = (values) => {
  const errors = {};
  const titleErr = validateRequired(values.title, 'Please give your habit a title');
  if (titleErr) errors.title = titleErr;
  if (values.title && values.title.length < 2) errors.title = 'Title should be at least 2 characters';
  if (values.color_code && !/^#?[0-9a-fA-F]{3,6}$/.test(values.color_code)) {
    errors.color_code = 'Use a hex color like #3B82F6';
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
