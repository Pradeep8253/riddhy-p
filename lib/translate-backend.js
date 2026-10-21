/**
 * Backend Data Localization Helper
 * Removed Hindi translations — returns standard English entities directly.
 */

export const categoryNamesHi = {};
export const productNamesHi = {};
export const productTaglinesHi = {};
export const badgeNamesHi = {};
export const eyebrowsHi = {};
export const sectionHeadersHi = {};
export const categoryDescriptionsHi = {};

export function getLocalizedProductName(product) {
  return product?.name || '';
}

export function getLocalizedProductTagline(product) {
  return product?.tagline || '';
}

export function getLocalizedCategoryName(categoryLabel) {
  return categoryLabel || '';
}

export function getLocalizedCategoryDescription(titleOrSlug, originalDesc) {
  return originalDesc || '';
}

export function getLocalizedEyebrow(eyebrow) {
  return eyebrow || '';
}

export function getLocalizedBadge(badgeText) {
  return badgeText || '';
}

export function getLocalizedWarranty(warrantyShort) {
  return warrantyShort || '';
}

export function getLocalizedSectionHeader(text) {
  return text || '';
}
