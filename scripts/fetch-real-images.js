import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const outDir = fileURLToPath(new URL('../public/images/', import.meta.url));
await mkdir(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url} (HTTP ${res.statusCode})`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        await writeFile(dest, buffer);
        resolve(buffer.length);
      });
    }).on('error', reject);
  });
}

const photoMap = {
  // Hero & Banners
  'hero-desktop.webp': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&h=700&q=75&fm=webp',
  'hero-mobile.webp': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&h=1000&q=75&fm=webp',
  'banner-festive.webp': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=500&q=75&fm=webp',
  'banner-festive-mobile.webp': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&h=800&q=75&fm=webp',
  'banner-appliances.webp': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&h=500&q=75&fm=webp',
  'banner-installation.webp': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&h=500&q=75&fm=webp',
  'og-image.webp': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&h=630&q=75&fm=webp',

  // Rooms
  'room-living.webp': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&h=600&q=75&fm=webp',
  'room-bedroom.webp': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&h=600&q=75&fm=webp',
  'room-dining.webp': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&h=600&q=75&fm=webp',
  'room-study.webp': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&h=600&q=75&fm=webp',
  'room-kitchen.webp': 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&h=600&q=75&fm=webp',

  // Products
  'product-sofa.webp': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-bed.webp': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-wardrobe.webp': 'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-dining.webp': 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-study.webp': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-mattress.webp': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-decor.webp': 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-storage.webp': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-fridge.webp': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-washer.webp': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-ac.webp': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-tv.webp': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-microwave.webp': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-chimney.webp': 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',
  'product-purifier.webp': 'https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=700&h=700&q=75&fm=webp',

  // Categories
  'category-sofas.webp': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-beds.webp': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-wardrobes.webp': 'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-dining.webp': 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-study.webp': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-mattresses.webp': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-decor.webp': 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-storage.webp': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-refrigerators.webp': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-washers.webp': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-ac.webp': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-tv.webp': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-microwave.webp': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-chimney.webp': 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',
  'category-purifier.webp': 'https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=600&h=600&q=75&fm=webp',

  // Reviews
  'review-living.webp': 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=640&h=520&q=75&fm=webp',
  'review-bedroom.webp': 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=640&h=520&q=75&fm=webp',
  'review-dining.webp': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=640&h=520&q=75&fm=webp',
  'review-delivery.webp': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=640&h=520&q=75&fm=webp',

  // Delivery & Services
  'delivery-illustration.webp': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=700&h=500&q=75&fm=webp',
  'installation-illustration.webp': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&h=500&q=75&fm=webp'
};

console.log(`Starting download of ${Object.keys(photoMap).length} real photographic assets...`);

let successCount = 0;
for (const [filename, url] of Object.entries(photoMap)) {
  const dest = join(outDir, filename);
  try {
    const size = await download(url, dest);
    successCount++;
    console.log(`[${successCount}/${Object.keys(photoMap).length}] Downloaded ${filename} (${(size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`Error downloading ${filename}:`, err.message);
  }
}

console.log(`Finished: ${successCount} assets saved to ${outDir}`);
