export async function fetchCategories(type) {
  if (typeof window === "undefined") {
    try {
      const { getCategories } = await import("@/lib/catalogue");
      return await getCategories(type);
    } catch (err) {
      console.warn("Server category fetch error:", err?.message);
      return [];
    }
  }

  try {
    const url = type
      ? `/api/categories?type=${encodeURIComponent(type)}`
      : `/api/categories`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error("Client category fetch error:", err);
    return [];
  }
}

export const getCategories = fetchCategories;

export const CATEGORIES = [];
export const CATEGORY_SEED = CATEGORIES;
export const BRANDS = [];

export default fetchCategories;
