export const categories = [
  { slug:'sofas', name:'Sofas', image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', count:84, parent:'furniture' },
  { slug:'beds', name:'Beds', image:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400', count:62, parent:'furniture' },
  { slug:'dining', name:'Dining Sets', image:'https://images.unsplash.com/photo-1615066028049-d164a270d6d1?w=400', count:48, parent:'furniture' },
  { slug:'wardrobes', name:'Wardrobes', image:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400', count:39, parent:'furniture' },
  { slug:'office', name:'Office Furniture', image:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', count:51, parent:'furniture' },
  { slug:'chairs', name:'Chairs', image:'https://images.unsplash.com/photo-1503602642458-232111445657?w=400', count:73, parent:'furniture' },
  { slug:'refrigerators', name:'Refrigerators', image:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400', count:34, parent:'appliances' },
  { slug:'washing-machines', name:'Washing Machines', image:'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400', count:28, parent:'appliances' },
  { slug:'air-conditioners', name:'Air Conditioners', image:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', count:31, parent:'appliances' },
  { slug:'televisions', name:'Televisions', image:'https://images.unsplash.com/photo-1593359677879-a4bb92f367d8?w=400', count:44, parent:'appliances' },
  { slug:'microwaves', name:'Microwaves', image:'https://images.unsplash.com/photo-1585237672814-8f85a8318bf6?w=400', count:19, parent:'appliances' },
  { slug:'air-coolers', name:'Air Coolers', image:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', count:16, parent:'appliances' },
];

export const brands = [
  { name:'Godrej Interio', logo:'GODREJ' }, { name:'Durian', logo:'DURIAN' }, { name:'Nilkamal', logo:'NILKAMAL' },
  { name:'LG', logo:'LG' }, { name:'Samsung', logo:'SAMSUNG' }, { name:'Whirlpool', logo:'WHIRLPOOL' },
  { name:'Daikin', logo:'DAIKIN' }, { name:'Sony', logo:'SONY' },
];

export const products = [
  {
    slug:'riddhy-luxe-3-seater-sofa-velvet-emerald',
    title:'Riddhy Luxe 3-Seater Velvet Sofa — Emerald',
    brand:'Godrej Interio', category:'sofas', rating:4.6, reviews:342,
    price:42999, mrp:68999, images:['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
    variants:[
      { sku:'SOFA-EMR-3S', label:'Emerald / 3-Seater', color:'#174D35', price:42999, mrp:68999, stock:12, image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
      { sku:'SOFA-BGE-3S', label:'Beige / 3-Seater', color:'#E8D7B5', price:41999, mrp:67999, stock:5, image:'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800' },
      { sku:'SOFA-CHAR-2S', label:'Charcoal / 2-Seater', color:'#252923', price:34999, mrp:55999, stock:0, image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
    ],
    specs:{ material:'Velvet + Solid Sheesham', dimensions:'218 x 92 x 86 cm', seating:'3 Seater', warranty:'3 Years Manufacturer', assembly:'Free Installation' },
    features:['High-density foam','Kiln-dried hardwood frame','Removable covers'],
    warrantyDays:1095
  },
  {
    slug:'mid-century-teak-dining-set-6-seater',
    title:'Mid-Century Teak Dining Set — 6 Seater with Bench',
    brand:'Durian', category:'dining', rating:4.8, reviews:189,
    price:58999, mrp:84999, images:['https://images.unsplash.com/photo-1615066028049-d164a270d6d1?w=800','https://images.unsplash.com/photo-1604578762231-1220b3b1dca3?w=800'],
    variants:[{ sku:'DIN-TEAK-6', label:'Teak Natural', color:'#B87F22', price:58999, mrp:84999, stock:8, image:'https://images.unsplash.com/photo-1615066028049-d164a270d6d1?w=800'}],
    specs:{ material:'Solid Teak Wood', dimensions:'180 x 90 x 75 cm', seating:'6 Seater', warranty:'5 Years' },
    warrantyDays:1825
  },
  {
    slug:'cloud-9-king-bed-with-storage-oak',
    title:'Cloud 9 King Bed with Hydraulic Storage — Oak',
    brand:'Nilkamal', category:'beds', rating:4.5, reviews:521,
    price:36999, mrp:54999, images:['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
    variants:[
      { sku:'BED-OAK-KING', label:'King / Oak', price:36999, mrp:54999, stock:15, color:'#D99A32', image:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'},
      { sku:'BED-WAL-KING', label:'King / Walnut', price:38999, mrp:56999, stock:7, color:'#5C3A21', image:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'},
    ],
    specs:{ material:'Engineered Wood + Oak Veneer', dimensions:'208 x 193 x 102 cm', storage:'Hydraulic Lift', warranty:'3 Years' },
    warrantyDays:1095
  },
  {
    slug:'ergowork-pro-mesh-office-chair',
    title:'ErgoWork Pro Mesh Office Chair — Lumbar Support',
    brand:'Godrej Interio', category:'office', rating:4.4, reviews:412,
    price:14999, mrp:22999, images:['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800'],
    variants:[{ sku:'CHAIR-MESH-BLK', label:'Black Mesh', color:'#252923', price:14999, mrp:22999, stock:22, image:'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800'}],
    specs:{ material:'Mesh + Aluminium Base', dimensions:'66 x 66 x 118 cm', warranty:'3 Years' },
    warrantyDays:1095
  },
  {
    slug:'scandi-lounge-armchair-rattan',
    title:'Scandi Lounge Armchair — Natural Rattan',
    brand:'Durian', category:'chairs', rating:4.7, reviews:98,
    price:18999, mrp:28999, images:['https://images.unsplash.com/photo-1503602642458-232111445657?w=800'],
    variants:[{ sku:'ARM-RATTAN-NAT', label:'Natural', color:'#E8D7B5', price:18999, mrp:28999, stock:10, image:'https://images.unsplash.com/photo-1503602642458-232111445657?w=800'}],
    specs:{ material:'Rattan + Teak', dimensions:'78 x 82 x 76 cm', warranty:'2 Years' },
    warrantyDays:730
  },
  {
    slug:'marble-top-coffee-table-brass',
    title:'Marble Top Coffee Table — Brass Inlay',
    brand:'Godrej Interio', category:'chairs', rating:4.6, reviews:76,
    price:22999, mrp:32999, images:['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800'],
    variants:[{ sku:'COFF-MAR-BRS', label:'White Marble', price:22999, mrp:32999, stock:6, color:'#FBF9F4', image:'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800'}],
    specs:{ material:'Marble + Brass', dimensions:'120 x 60 x 42 cm', warranty:'2 Years' },
    warrantyDays:730
  },
  {
    slug:'slide-4door-wardrobe-walnut-mirror',
    title:'Slide 4-Door Wardrobe — Walnut with Mirror',
    brand:'Godrej Interio', category:'wardrobes', rating:4.3, reviews:203,
    price:45999, mrp:68999, images:['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'],
    variants:[{ sku:'WARD-4D-WAL', label:'Walnut', color:'#5C3A21', price:45999, mrp:68999, stock:4, image:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'}],
    specs:{ material:'Engineered Wood', dimensions:'200 x 60 x 210 cm', warranty:'3 Years' },
    warrantyDays:1095
  },
  // Appliances
  {
    slug:'lg-242l-smart-inverter-refrigerator',
    title:'LG 242L Smart Inverter Double Door Refrigerator',
    brand:'LG', category:'refrigerators', rating:4.5, reviews:892,
    price:26990, mrp:32990, images:['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800'],
    variants:[
      { sku:'REF-LG242-SIL', label:'Shiny Steel', color:'#C0C0C0', price:26990, mrp:32990, stock:18, image:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800'},
      { sku:'REF-LG242-BLK', label:'Midnight Black', color:'#111', price:27990, mrp:33990, stock:9, image:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800'},
    ],
    specs:{ capacity:'242 L', energy:'3 Star', inverter:'Smart Inverter', warranty:'1 Year + 10 Years Compressor' },
    warrantyDays:365
  },
  {
    slug:'samsung-7kg-fully-automatic-washing-machine',
    title:'Samsung 7kg Fully Automatic Top Load Washing Machine',
    brand:'Samsung', category:'washing-machines', rating:4.4, reviews:634,
    price:18990, mrp:23900, images:['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800'],
    variants:[{ sku:'WM-SAM7-SIL', label:'Silver', color:'#C0C0C0', price:18990, mrp:23900, stock:14, image:'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800'}],
    specs:{ capacity:'7 kg', type:'Top Load', energy:'5 Star', warranty:'2 Years' },
    warrantyDays:730
  },
  {
    slug:'daikin-1-5-ton-5-star-inverter-ac',
    title:'Daikin 1.5 Ton 5 Star Inverter Split AC — Copper',
    brand:'Daikin', category:'air-conditioners', rating:4.6, reviews:412,
    price:38990, mrp:58990, images:['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
    variants:[{ sku:'AC-DAIK15-5S', label:'1.5 Ton / 5 Star', price:38990, mrp:58990, stock:11, color:'#FFFFFF', image:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'}],
    specs:{ tonnage:'1.5 Ton', star:'5 Star', inverter:'Yes', warranty:'1 Year + 5 Years PCB' },
    warrantyDays:365
  },
  {
    slug:'sony-55-inch-4k-bravia-google-tv',
    title:'Sony 55" 4K Ultra HD Bravia Google TV — X80L',
    brand:'Sony', category:'televisions', rating:4.7, reviews:1023,
    price:54990, mrp:79990, images:['https://images.unsplash.com/photo-1593359677879-a4bb92f367d8?w=800'],
    variants:[{ sku:'TV-SONY55-X80', label:'55 inch', price:54990, mrp:79990, stock:20, color:'#111', image:'https://images.unsplash.com/photo-1593359677879-a4bb92f367d8?w=800'}],
    specs:{ size:'55 inch', resolution:'4K UHD', os:'Google TV', warranty:'1 Year' },
    warrantyDays:365
  },
  {
    slug:'whirlpool-20l-convection-microwave',
    title:'Whirlpool 20L Convection Microwave — Black',
    brand:'Whirlpool', category:'microwaves', rating:4.2, reviews:221,
    price:8990, mrp:11990, images:['https://images.unsplash.com/photo-1585237672814-8f85a8318bf6?w=800'],
    variants:[{ sku:'MW-WP20-BLK', label:'Black', price:8990, mrp:11990, stock:30, color:'#111', image:'https://images.unsplash.com/photo-1585237672814-8f85a8318bf6?w=800'}],
    specs:{ capacity:'20 L', type:'Convection', warranty:'1 Year' },
    warrantyDays:365
  },
  {
    slug:'symphony-75l-desert-air-cooler',
    title:'Symphony 75L Desert Air Cooler — i-Pure Technology',
    brand:'LG', category:'air-coolers', rating:4.1, reviews:156,
    price:12990, mrp:16990, images:['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'],
    variants:[{ sku:'COOL-SYM75', label:'White/Grey', price:12990, mrp:16990, stock:25, color:'#FBF9F4', image:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'}],
    specs:{ capacity:'75 L', coverage:'600 sq ft', warranty:'1 Year' },
    warrantyDays:365
  },
];

// Extend to ~24 by duplicating with variations programmatically (client will slice)
export const allProducts = [...products,
  ...products.slice(0,12).map((p,i)=>({ ...p, slug: p.slug+'-v'+i, title: p.title+' — Variant '+(i+1), price: p.price - (i*500), mrp: p.mrp })),
];

export const banners = [
  { id:1, title:'Festive Home Makeover', subtitle:'Up to 60% off on Sofas & Beds', cta:'Shop Furniture', image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400', zone:'hero', bg:'#0F3624' },
  { id:2, title:'Cool Summer Deals', subtitle:'ACs & Refrigerators from ₹18,990', cta:'Shop Appliances', image:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400', zone:'hero', bg:'#D99A32' },
  { id:3, title:'Monsoon Ready Homes', subtitle:'Wardrobes & Storage Solutions', cta:'Explore', image:'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400', zone:'hero', bg:'#174D35' },
];

export const sampleOrders = [
  { id:'RF-2025-88421', date:'2025-09-18', status:'Delivered', total:42999, items:[allProducts[0]], timeline:['Paid/Confirmed','Processing','Shipped','Out for Delivery','Delivered'] },
  { id:'RF-2025-88422', date:'2025-10-02', status:'Shipped', total:26990, items:[allProducts[7]], timeline:['Paid/Confirmed','Processing','Shipped'] },
];

export const warrantyRecords = [
  { id:'w1', product: allProducts[0], purchaseDate:'2024-02-10', activationDate:'2024-02-18', expiry:'2027-02-18', totalDays:1095, daysRemaining: 842, status:'Active' },
  { id:'w2', product: allProducts[7], purchaseDate:'2023-08-12', activationDate:'2023-08-14', expiry:'2024-08-14', totalDays:365, daysRemaining: 18, status:'Expiring Soon' },
  { id:'w3', product: allProducts[10], purchaseDate:'2022-05-01', activationDate:'2022-05-06', expiry:'2023-05-06', totalDays:365, daysRemaining: 0, status:'Expired' },
  { id:'w4', product: allProducts[2], purchaseDate:'2025-10-10', activationDate:null, expiry:null, totalDays:1095, daysRemaining: null, status:'Pending Activation' },
];

export const reviewsSample = [
  { name:'Aarav Mehta', rating:5, date:'2025-08-21', text:'Build quality is fantastic, delivery was on time and installation was super clean. RF Riddhy team is very professional.', verified:true, images:[] },
  { name:'Sneha Gupta', rating:4, date:'2025-09-02', text:'Loved the velvet finish. Only 4 stars because delivery took 2 extra days.', verified:true, images:[] },
  { name:'Vikram Singh', rating:5, date:'2025-09-18', text:'Value for money! Looks premium in our living room.', verified:false, images:[] },
];
