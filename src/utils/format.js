export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'Vaidation failed';
  if (errors && Array.isArray(errors)) {
    return errors.issues.map(detail => detail.message).join(', ');
  }
  return JSON.stringify(errors);
};
