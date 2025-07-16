/**
 * Utility functions for consistent category handling across the application
 */

// Map of valid categories (lowercase) to their canonical form
const validCategories = {
  'tshirts': 'tshirts',
  't-shirts': 'tshirts',
  'tshirt': 'tshirts',
  't-shirt': 'tshirts',
  'polo': 'polo',
  'polos': 'polo',
  'poloshirt': 'polo',
  'polo-shirt': 'polo',
  'formalshirts': 'formalshirts',
  'formal': 'formalshirts',
  'formal-shirts': 'formalshirts',
  'formalshirt': 'formalshirts',
  'formal-shirt': 'formalshirts'
};

/**
 * Normalize a category string to its canonical form
 * @param {string} category - The category to normalize
 * @returns {string} The normalized category
 */
const normalizeCategory = (category) => {
  if (!category) return '';
  
  const lowercaseCategory = category.toLowerCase().trim();
  return validCategories[lowercaseCategory] || lowercaseCategory;
};

/**
 * Check if two categories match using normalized forms
 * @param {string} category1 - First category
 * @param {string} category2 - Second category
 * @returns {boolean} Whether the categories match
 */
const categoriesMatch = (category1, category2) => {
  return normalizeCategory(category1) === normalizeCategory(category2);
};

/**
 * Get all valid canonical categories
 * @returns {string[]} Array of valid canonical category names
 */
const getValidCategories = () => {
  return [...new Set(Object.values(validCategories))];
};

/**
 * Check if a category is valid
 * @param {string} category - Category to check
 * @returns {boolean} Whether the category is valid
 */
const isValidCategory = (category) => {
  const normalized = normalizeCategory(category);
  return getValidCategories().includes(normalized);
};

module.exports = {
  normalizeCategory,
  categoriesMatch,
  getValidCategories,
  isValidCategory,
  validCategories
};

