/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to slugify
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove accents/diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove invalid characters
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by appending ID if needed
 * @param name - The name to create slug from
 * @param id - Optional ID to append for uniqueness
 * @returns A unique slug
 */
export function generateUniqueSlug(name: string, id?: number): string {
  const slug = generateSlug(name);
  return id ? `${slug}-${id}` : slug;
}
