/**
 * Backend Data Localization Dictionary & Helper
 * Maps database/backend entities (products, categories, badges, warranties, section headers, eyebrows, descriptions)
 * into Hindi when locale === 'hi'. Also respects native schema fields (e.g. name_hi, description_hi).
 */

export const categoryNamesHi = {
  'sofas': 'सोफ़ा एवं सेक्शनल',
  'sofa': 'सोफ़ा',
  'Sofas & Sectionals': 'सोफ़ा एवं सेक्शनल',
  'beds': 'बिस्तर',
  'bed': 'बिस्तर',
  'Beds': 'बिस्तर',
  'wardrobes': 'अलमारी',
  'wardrobe': 'अलमारी',
  'Wardrobes': 'अलमारी',
  'dining-sets': 'डाइनिंग सेट',
  'dining': 'डाइनिंग सेट',
  'Dining Sets': 'डाइनिंग सेट',
  'study-tables': 'स्टडी एवं वर्क',
  'study': 'स्टडी एवं वर्क',
  'Study & Work': 'स्टडी एवं वर्क',
  'mattresses': 'गद्दे',
  'mattress': 'गद्दा',
  'Mattresses': 'गद्दे',
  'decor': 'होम डेकोर',
  'Home Décor': 'होम डेकोर',
  'storage': 'स्टोरेज एवं शेल्विंग',
  'Storage & Shelving': 'स्टोरेज एवं शेल्विंग',
  'refrigerators': 'रेफ़्रिजरेटर',
  'refrigerator': 'रेफ़्रिजरेटर',
  'Refrigerators': 'रेफ़्रिजरेटर',
  'washing-machines': 'वॉशिंग मशीन',
  'washer': 'वॉशिंग मशीन',
  'Washing Machines': 'वॉशिंग मशीन',
  'air-conditioners': 'एयर कंडीशनर',
  'ac': 'एयर कंडीशनर',
  'Air Conditioners': 'एयर कंडीशनर',
  'televisions': 'टेलीविज़न (टीवी)',
  'tv': 'टीवी',
  'Televisions': 'टेलीविज़न (टीवी)',
  'microwaves': 'माइक्रोवेव',
  'microwave': 'माइक्रोवेव',
  'Microwaves': 'माइक्रोवेव',
  'chimneys': 'किचन चिमनी',
  'chimney': 'किचन चिमनी',
  'Kitchen Chimneys': 'किचन चिमनी',
  'water-purifiers': 'वॉटर प्यूरीफायर',
  'purifier': 'वॉटर प्यूरीफायर',
  'Water Purifiers': 'वॉटर प्यूरीफायर',
  'Home appliances': 'घरेलू उपकरण',
  'Furniture': 'फ़र्नीचर'
};

export const productNamesHi = {
  // Sofas
  'mira-3-seater-sofa': 'मीरा 3-सीटर सोफ़ा',
  'Mira 3-Seater Sofa': 'मीरा 3-सीटर सोफ़ा',
  'aarav-l-shape-sectional': 'आरव एल-शेप सेक्शनल सोफ़ा',
  'Aarav L-Shape Sectional': 'आरव एल-शेप सेक्शनल सोफ़ा',
  'nila-loveseat': 'नीला लवसीट सोफ़ा',
  'Nila Loveseat': 'नीला लवसीट सोफ़ा',

  // Beds
  'avani-queen-storage-bed': 'अवनी क्वीन स्टोरेज बेड',
  'Avani Queen Storage Bed': 'अवनी क्वीन स्टोरेज बेड',
  'kesar-platform-bed': 'केसर प्लेटफ़ॉर्म बेड',
  'Kesar Platform Bed': 'केसर प्लेटफ़ॉर्म बेड',
  'mitti-daybed': 'मिट्टी डे-बेड',
  'Mitti Daybed': 'मिट्टी डे-बेड',

  // Wardrobes
  'saanvi-3-door-wardrobe': 'सान्वी 3-डोर अलमारी',
  'Saanvi 3-Door Wardrobe': 'सान्वी 3-डोर अलमारी',
  'nivaan-sliding-wardrobe': 'निवान स्लाइडिंग अलमारी',
  'Nivaan Sliding Wardrobe': 'निवान स्लाइडिंग अलमारी',
  'arohi-2-door-wardrobe': 'आरोही 2-डोर अलमारी',
  'Arohi 2-Door Wardrobe': 'आरोही 2-डोर अलमारी',

  // Dining
  'neem-4-seater-dining-set': 'नीम 4-सीटर डाइनिंग सेट',
  'Neem 4-Seater Dining Set': 'नीम 4-सीटर डाइनिंग सेट',
  'kaira-round-dining-set': 'कायरा राउंड डाइनिंग सेट',
  'Kaira Round Dining Set': 'कायरा राउंड डाइनिंग सेट',
  'saffron-6-seater-dining-set': 'सैफ़्रॉन 6-सीटर डाइनिंग सेट',
  'Saffron 6-Seater Dining Set': 'सैफ़्रॉन 6-सीटर डाइनिंग सेट',

  // Study
  'sutra-study-desk': 'सूत्र स्टडी डेस्क',
  'Sutra Study Desk': 'सूत्र स्टडी डेस्क',
  'aarav-workstation': 'आरव वर्कस्टेशन',
  'Aarav Workstation': 'आरव वर्कस्टेशन',
  'lipi-writing-table': 'लिपि राइटिंग टेबल',
  'Lipi Writing Table': 'लिपि राइटिंग टेबल',

  // Mattresses
  'cloudrest-ortho-mattress': 'क्लाउडरेस्ट ऑर्थो गद्दा',
  'CloudRest Ortho Mattress': 'क्लाउडरेस्ट ऑर्थो गद्दा',
  'sukoon-pocket-mattress': 'सुकून पॉकेट गद्दा',
  'Sukoon Pocket Mattress': 'सुकून पॉकेट गद्दा',
  'nidra-memory-mattress': 'निद्रा मेमोरी गद्दा',
  'Nidra Memory Mattress': 'निद्रा मेमोरी गद्दा',

  // Decor
  'aangan-accent-lamp': 'आंगन एक्सेंट लैंप',
  'Aangan Accent Lamp': 'आंगन एक्सेंट लैंप',
  'moringa-planter-set': 'मोरिंगा प्लांटर सेट',
  'Moringa Planter Set': 'मोरिंगा प्लांटर सेट',
  'rang-cushion-duo': 'रंग कुशन जोड़ी',
  'Rang Cushion Duo': 'रंग कुशन जोड़ी',

  // Storage
  'katha-bookshelf': 'कथा बुकशेल्फ़',
  'Katha Bookshelf': 'कथा बुकशेल्फ़',
  'sajilo-shoe-cabinet': 'सजिलो शू कैबिनेट',
  'Sajilo Shoe Cabinet': 'सजिलो शू कैबिनेट',
  'reva-sideboard': 'रेवा साइडबोर्ड',
  'Reva Sideboard': 'रेवा साइडबोर्ड',

  // Refrigerators
  'veda-300l-frost-free-refrigerator': 'वेदा 300L फ्रॉस्ट-फ्री रेफ़्रिजरेटर',
  'Veda 300L Frost-Free Refrigerator': 'वेदा 300L फ्रॉस्ट-फ्री रेफ़्रिजरेटर',
  'prana-240l-double-door': 'प्राण 240L डबल डोर रेफ़्रिजरेटर',
  'Prana 240L Double Door': 'प्राण 240L डबल डोर रेफ़्रिजरेटर',
  'nivaan-190l-direct-cool': 'निवान 190L डायरेक्ट कूल रेफ़्रिजरेटर',
  'Nivaan 190L Direct Cool': 'निवान 190L डायरेक्ट कूल रेफ़्रिजरेटर',

  // Washers
  'veda-8kg-front-load-washer': 'वेदा 8kg फ्रंट लोड वॉशर',
  'Veda 8kg Front Load Washer': 'वेदा 8kg फ्रंट लोड वॉशर',
  'aarohan-7kg-top-load-washer': 'आरोहण 7kg टॉप लोड वॉशर',
  'Aarohan 7kg Top Load Washer': 'आरोहण 7kg टॉप लोड वॉशर',
  'prana-9kg-front-load-washer': 'प्राण 9kg फ्रंट लोड वॉशर',
  'Prana 9kg Front Load Washer': 'प्राण 9kg फ्रंट लोड वॉशर',

  // Air Conditioners
  'aarohan-1-5t-inverter-ac': 'आरोहण 1.5 टन इन्वर्टर एसी',
  'Aarohan 1.5T Inverter AC': 'आरोहण 1.5 टन इन्वर्टर एसी',
  'veda-1t-inverter-ac': 'वेदा 1 टन इन्वर्टर एसी',
  'Veda 1T Inverter AC': 'वेदा 1 टन इन्वर्टर एसी',
  'prana-2t-inverter-ac': 'प्राण 2 टन इन्वर्टर एसी',
  'Prana 2T Inverter AC': 'प्राण 2 टन इन्वर्टर एसी',

  // Televisions
  'veda-55-inch-4k-tv': 'वेदा 55-इंच 4K स्मार्ट टीवी',
  'Veda 55-inch 4K TV': 'वेदा 55-इंच 4K स्मार्ट टीवी',
  'prana-43-inch-qled-tv': 'प्राण 43-इंच QLED टीवी',
  'Prana 43-inch QLED TV': 'प्राण 43-इंच QLED टीवी',
  'aarohan-65-inch-4k-tv': 'आरोहण 65-इंच 4K टीवी',
  'Aarohan 65-inch 4K TV': 'आरोहण 65-इंच 4K टीवी',

  // Microwaves
  'veda-28l-convection-microwave': 'वेदा 28L कन्वेक्शन माइक्रोवेव',
  'Veda 28L Convection Microwave': 'वेदा 28L कन्वेक्शन माइक्रोवेव',
  'prana-20l-solo-microwave': 'प्राण 20L सोलो माइक्रोवेव',
  'Prana 20L Solo Microwave': 'प्राण 20L सोलो माइक्रोवेव',
  'aarohan-25l-grill-microwave': 'आरोहण 25L ग्रिल माइक्रोवेव',
  'Aarohan 25L Grill Microwave': 'आरोहण 25L ग्रिल माइक्रोवेव',

  // Chimneys
  'veda-90cm-auto-clean-chimney': 'वेदा 90cm ऑटो-क्लीन चिमनी',
  'Veda 90cm Auto-Clean Chimney': 'वेदा 90cm ऑटो-क्लीन चिमनी',
  'prana-60cm-wall-chimney': 'प्राण 60cm वॉल चिमनी',
  'Prana 60cm Wall Chimney': 'प्राण 60cm वॉल चिमनी',
  'aarohan-75cm-motion-chimney': 'आरोहण 75cm मोशन चिमनी',
  'Aarohan 75cm Motion Chimney': 'आरोहण 75cm मोशन चिमनी',

  // Water Purifiers
  'veda-ro-uv-water-purifier': 'वेदा RO+UV वॉटर प्यूरीफायर',
  'Veda RO+UV Water Purifier': 'वेदा RO+UV वॉटर प्यूरीफायर',
  'prana-copper-ro-purifier': 'प्राण कॉपर RO प्यूरीफायर',
  'Prana Copper RO Purifier': 'प्राण कॉपर RO प्यूरीफायर',
  'aarohan-uv-uf-purifier': 'आरोहण UV+UF प्यूरीफायर',
  'Aarohan UV+UF Purifier': 'आरोहण UV+UF प्यूरीफायर'
};

export const productTaglinesHi = {
  'soft sage upholstery': 'मुलायम सेज फ़ैब्रिक अपहोल्स्ट्री',
  'roomy reversible chaise': 'आरामदायक रिवर्सिबल चेज़',
  'compact apartment comfort': 'छोटे अपार्टमेंट के लिए आरामदायक',
  'hydraulic lift storage': 'हाइड्रोलिक लिफ़्ट स्टोरेज',
  'solid mango-wood frame': 'सॉलिड मैंगो-वुड फ़्रेम',
  'simple guest-room style': 'गेस्ट रूम के लिए सादा और सुंदर',
  'quiet soft-close hinges': 'शांत सॉफ़्ट-क्लोज़ हिंज',
  'space-saving sliding doors': 'जगह बचाने वाले स्लाइडिंग दरवाज़े',
  'thoughtful everyday storage': 'रोज़मर्रा के लिए भरपूर स्टोरेज',
  'solid-wood dining for four': 'चार लोगों के लिए सॉलिड वुड डाइनिंग',
  'soft-edged compact table': 'कॉम्पैक्ट गोल डाइनिंग टेबल',
  'room for gathering': 'पूरे परिवार के लिए बड़ा डाइनिंग सेट',
  'cable-ready work surface': 'केबल मैनेजमेंट के साथ स्टडी टेबल',
  'drawer and book ledge': 'दराज और बुक लेज के साथ',
  'light, minimal footprint': 'हल्का और मिनिमल डिज़ाइन',
  'balanced medium-firm support': 'संतुलित मीडियम-फ़र्म सपोर्ट',
  'individually wrapped coils': 'इंडिविजुअल पॉकेट स्प्रिंग',
  'contouring comfort layer': 'बॉडी-कंटूरिंग मेमोरी लेयर',
  'warm diffused glow': 'सौम्य और गर्म रोशनी',
  'hand-finished ceramic pair': 'हस्तनिर्मित सिरेमिक जोड़ी',
  'woven cotton texture': 'बुना हुआ कॉटन टेक्सचर',
  'open shelves for daily finds': 'किताबों के लिए ओपन शेल्फ़',
  'vented entryway storage': 'हवादार शू कैबिनेट',
  'closed storage with warm grain': 'वुड ग्रेन के साथ बंद स्टोरेज',
  'convertible cooling zones': 'कन्वर्टिबल कूलिंग ज़ोन',
  'quiet inverter compressor': 'शांत इन्वर्टर कंप्रेसर',
  'everyday family essentials': 'किफ़ायती एवं टिकाऊ कूलिंग',
  'steam care and quick cycle': 'स्टीम केयर एवं क्विक साइकिल',
  'gentle wash, easy controls': 'सॉफ्ट वॉश, आसान कंट्रोल',
  'large-family capacity': 'बड़े परिवार के लिए अधिक क्षमता',
  'adaptive inverter cooling': 'अडैप्टिव इन्वर्टर कूलिंग',
  'quiet comfort for bedrooms': 'बेडरूम के लिए शांत कूलिंग',
  'high-capacity room cooling': 'बड़े कमरों के लिए तेज़ कूलिंग',
  'vivid 4K smart entertainment': 'शानदार 4K स्मार्ट एंटरटेनमेंट',
  'rich colour in a compact size': 'गहरे रंग, कॉम्पैक्ट साइज़',
  'cinema-scale family viewing': 'सिनेमा जैसा अनुभव',
  'bake, grill and reheat': 'बेक, ग्रिल और रीहीट',
  'simple everyday reheating': 'सरल रोज़मर्रा का उपयोग',
  'quick crisp finish': 'त्वरित क्रिस्पी ग्रिलिंग',
  'wide capture with easy cleaning': 'बड़ा कवरेज एवं आसान सफ़ाई',
  'compact kitchen ventilation': 'कॉम्पैक्ट किचन वेंटिलेशन',
  'hands-free gesture control': 'हैंड्स-फ्री जेस्चर कंट्रोल',
  'multi-stage water care': 'मल्टी-स्टेज शुद्धिकरण',
  'copper-enriched final stage': 'कॉपर युक्त शुद्ध पानी',
  'compact under-sink option': 'कॉम्पैक्ट अंडर-सिंक विकल्प'
};

export const badgeNamesHi = {
  'Best Seller': 'बेस्ट सेलर',
  'BEST SELLER': 'बेस्ट सेलर',
  'best-selling': 'बेस्ट सेलर',
  'Popular': 'लोकप्रिय',
  'POPULAR': 'लोकप्रिय',
  'popular': 'लोकप्रिय',
  'Trending': 'ट्रेंडिंग',
  'TRENDING': 'ट्रेंडिंग',
  'trending': 'ट्रेंडिंग',
  'New': 'नया आगमन',
  'NEW': 'नया आगमन',
  'new-arrival': 'नया आगमन',
  'Featured': 'विशेष',
  'FEATURED': 'विशेष',
  'featured': 'विशेष',
  'Deal': 'ऑफ़र',
  'DEAL': 'ऑफ़र',
  'Only 3 left': 'केवल 3 शेष',
  'ONLY 3 LEFT': 'केवल 3 शेष',
  'Sold Out': 'स्टॉक समाप्त',
  'SOLD OUT': 'स्टॉक समाप्त',
  'In Stock': 'स्टॉक में उपलब्ध',
  'IN STOCK': 'स्टॉक में उपलब्ध'
};

export const eyebrowsHi = {
  'Appliances · precision studio': 'घरेलू उपकरण · प्रिसिजन स्टूडियो',
  'appliances · precision studio': 'घरेलू उपकरण · प्रिसिजन स्टूडियो',
  'APPLIANCES · PRECISION STUDIO': 'घरेलू उपकरण · प्रिसिजन स्टूडियो',
  'Appliance precision studio': 'घरेलू उपकरण प्रिसिजन स्टूडियो',
  'Furniture · room-first living': 'फ़र्नीचर · रूम-फ़र्स्ट लिविंग',
  'furniture · room-first living': 'फ़र्नीचर · रूम-फ़र्स्ट लिविंग',
  'FURNITURE · ROOM-FIRST LIVING': 'फ़र्नीचर · रूम-फ़र्स्ट लिविंग',
  'Riddhy living spaces': 'रिद्धि लिविंग स्पेसेस',
  'The Riddhy collection': 'रिद्धि कलेक्शन',
  'the riddhy collection': 'रिद्धि कलेक्शन',
  'Curated Collection': 'विशेष कलेक्शन',
  'Most Loved · Customer Favourites': 'सर्वाधिक पसंद · ग्राहकों की पसंद',
  'Community Choice · High Demand': 'समुदाय की पसंद · उच्च मांग',
  'In High Demand · Style Forward': 'उच्च मांग · आधुनिक स्टाइल',
  'Fresh in the Showroom': 'शोरूम में नए आगमन',
  'Editor’s Curated Selection': 'संपादक द्वारा चयनित',
  'Special Value · Limited Period': 'विशेष मूल्य · सीमित समय',
  'Side by side, clearly': 'आमने-सामने, स्पष्ट तुलना',
  'Offers, with the details up front': 'ऑफ़र, स्पष्ट शर्तों के साथ'
};

export const sectionHeadersHi = {
  'Bestsellers, thoughtfully picked': 'बेस्टसेलर्स, आपके लिए विशेष रूप से चुने गए',
  'The pieces people come back to.': 'वे उत्पाद जिन्हें लोग सबसे अधिक पसंद करते हैं।',
  'Trending this season': 'इस मौसम में सबसे लोकप्रिय',
  'In demand for modern spaces.': 'आधुनिक घरों की पहली पसंद।',
  'Fresh in the showroom': 'शोरूम में नए आगमन',
  'New arrivals for your space.': 'आपके घर के लिए नए और ताज़ा उत्पाद।',
  'Shop by room': 'कमरे के अनुसार ख़रीदारी',
  'Start with the room you’re shaping.': 'उस कमरे से शुरुआत करें जिसे आप सजाना चाहते हैं।',
  'Layer furniture, light and useful details into a space that feels like yours.': 'फ़र्नीचर और रोशनी से अपने घर को सुंदर और आरामदायक बनाएं।',
  'Explore all rooms': 'सभी कमरे देखें',
  'Curated Living': 'विचारशील लिविंग',
  'Shop the look, piece by piece.': 'एक-एक करके पूरा लुक सजाएं।',
  'Plan my room': 'कमरे की योजना बनाएं',
  'Interactive Room Layout': 'इंटरैक्टिव रूम लेआउट',
  'Try a room, piece by piece.': 'अपने कमरे में 3D लेआउट आज़माएं।',
  'Delivery & installation': 'डिलीवरी एवं इंस्टॉलेशन',
  'From your shortlist to your space.': 'आपकी पसंद से आपके घर तक।',
  'Homes, in their own words': 'ग्राहकों की ज़ुबानी',
  'A space for real customer stories.': 'हमारे संतुष्ट परिवारों के सच्चे अनुभव।',
  'Appliance precision studio': 'घरेलू उपकरण प्रिसिजन स्टूडियो',
  'Good decisions start with clear details.': 'सही निर्णय की शुरुआत स्पष्ट विवरण से होती है।',
  'Compare the things that matter—capacity, energy use, dimensions and installation—without losing the warmth of home.': 'ज़रूरी चीज़ों की तुलना करें — क्षमता, ऊर्जा खपत, माप और इंस्टॉलेशन — आसानी के साथ।',
  'Power the everyday.': 'हर दिन को बनाएं सहज और ऊर्जावान।',
  'Compare capacity, energy ratings, dimensions and service options with clear, reassuring detail.': 'क्षमता, ऊर्जा रेटिंग, माप और सर्विस विवरण की स्पष्ट तुलना करें।',
  'Furniture with room to live.': 'खुलकर जीने के लिए आरामदायक फ़र्नीचर।',
  'Warm materials, useful proportions and pieces made to work with everyday life.': 'प्राकृतिक सामग्री, सही आकार और रोज़मर्रा की ज़िंदगी के लिए उपयुक्त डिज़ाइन्स।',
  'Best Selling Furniture & Appliances': 'सर्वाधिक बिकने वाले फ़र्नीचर एवं उपकरण',
  'Popular Collections': 'लोकप्रिय कलेक्शन्स',
  'Trending This Season': 'इस मौसम में ट्रेंडिंग',
  'New Arrivals': 'नए आगमन',
  'Featured Collection': 'विशेष कलेक्शन',
  'Exclusive Deals & Value Offers': 'विशेष ऑफ़र एवं छूट',
  'Compare products.': 'उत्पादों की तुलना करें।',
  'Explore the collection': 'कलेक्शन देखें',
  'Home appliance collection': 'घरेलू उपकरण कलेक्शन',
  'Furniture collection': 'फ़र्नीचर कलेक्शन'
};

export const categoryDescriptionsHi = {
  'refrigerators': 'रेफ़्रिजरेटर की क्षमता, ऊर्जा खपत, माप और डिलीवरी विकल्पों की स्पष्ट तुलना करें।',
  'washing-machines': 'वॉशिंग मशीन की क्षमता, वॉश प्रोग्राम, ऊर्जा रेटिंग और सर्विस विवरण देखें।',
  'air-conditioners': 'कमरे के आकार, टन क्षमता और इन्वर्टर पावर के अनुसार एयर कंडीशनर चुनें।',
  'televisions': 'स्क्रीन साइज़, डिस्प्ले तकनीक, 4K रिज़ॉल्यूशन और साउंड विवरण देखें।',
  'microwaves': 'कॉम्पैक्ट और ऑल-इन-वन माइक्रोवेव ओवन, ग्रिल और कन्वेक्शन विकल्प।',
  'chimneys': 'शक्तिशाली सक्शन, ऑटो-क्लीन और मोशन सेंसर वाली किचन चिमनियां।',
  'water-purifiers': 'RO+UV+UF मल्टी-स्टेज वाटर प्यूरीफायर आपके परिवार के स्वास्थ्य के लिए।',
  'sofas': 'आधुनिक लिविंग रूम के लिए हस्तनिर्मित सोफ़ा, एल-शेप सेक्शनल एवं लवसीट्स।',
  'beds': 'सॉलिड वुड एवं हाइड्रोलिक स्टोरेज बेड, टिकाऊ और आरामदायक नींद के लिए।',
  'wardrobes': 'स्लाइडिंग और हिंज्ड अलमारियां, पर्याप्त स्टोरेज और सुरुचिपूर्ण डिज़ाइन।',
  'dining-sets': 'सॉलिड शीशम एवं टीक वुड डाइनिंग टेबल और कुर्सियां।',
  'study-tables': 'वर्क-फ्रॉम-होम और अध्ययन के लिए एर्गोनॉमिक स्टडी डेस्क।',
  'mattresses': 'ऑर्थोपेडिक, पॉकेट स्प्रिंग और मेमोरी फोम गद्दे।',
  'decor': 'घर को सजाने के लिए हस्तनिर्मित एक्सेंट लैंप, सिरेमिक प्लांटर्स और कुशन।',
  'storage': 'बुकशेल्फ़, शू कैबिनेट और साइडबोर्ड — आपके घर के लिए व्यवस्थित स्टोरेज।'
};

/**
 * Returns localized product name
 */
export function getLocalizedProductName(product, locale = 'en') {
  if (locale !== 'hi' || !product) return product?.name || '';
  if (product.name_hi) return product.name_hi;
  if (productNamesHi[product.name]) return productNamesHi[product.name];
  if (product.slug && productNamesHi[product.slug]) return productNamesHi[product.slug];
  return product.name || '';
}

/**
 * Returns localized product tagline
 */
export function getLocalizedProductTagline(product, locale = 'en') {
  if (locale !== 'hi' || !product) return product?.tagline || '';
  if (product.tagline_hi) return product.tagline_hi;
  if (product.tagline && productTaglinesHi[product.tagline]) return productTaglinesHi[product.tagline];
  return product.tagline || '';
}

/**
 * Returns localized category name
 */
export function getLocalizedCategoryName(categoryLabel, locale = 'en') {
  if (locale !== 'hi' || !categoryLabel) return categoryLabel || '';
  return categoryNamesHi[categoryLabel] || categoryLabel;
}

/**
 * Returns localized category description
 */
export function getLocalizedCategoryDescription(titleOrSlug, originalDesc, locale = 'en') {
  if (locale !== 'hi') return originalDesc || '';
  const key = String(titleOrSlug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (categoryDescriptionsHi[key]) return categoryDescriptionsHi[key];
  if (categoryDescriptionsHi[titleOrSlug]) return categoryDescriptionsHi[titleOrSlug];
  if (originalDesc && sectionHeadersHi[originalDesc]) return sectionHeadersHi[originalDesc];
  return originalDesc || '';
}

/**
 * Returns localized eyebrow text
 */
export function getLocalizedEyebrow(eyebrow, locale = 'en') {
  if (locale !== 'hi' || !eyebrow) return eyebrow || '';
  return eyebrowsHi[eyebrow] || sectionHeadersHi[eyebrow] || eyebrow;
}

/**
 * Returns localized badge text (e.g. "Best Seller" -> "बेस्ट सेलर", "15% off" -> "15% छूट")
 */
export function getLocalizedBadge(badgeText, locale = 'en') {
  if (locale !== 'hi' || !badgeText) return badgeText || '';
  if (badgeNamesHi[badgeText]) return badgeNamesHi[badgeText];
  const offMatch = badgeText.match(/^(\d+)%\s*off$/i);
  if (offMatch) return `${offMatch[1]}% छूट`;
  const onlyLeftMatch = badgeText.match(/^only\s*(\d+)\s*left$/i);
  if (onlyLeftMatch) return `केवल ${onlyLeftMatch[1]} शेष`;
  return badgeText;
}

/**
 * Returns localized warranty short label (e.g. "2 Yr" -> "2 वर्ष")
 */
export function getLocalizedWarranty(warrantyShort, locale = 'en') {
  if (locale !== 'hi' || !warrantyShort) return warrantyShort || '';
  return warrantyShort.replace(/(\d+)\s*Yr/i, '$1 वर्ष');
}

/**
 * Returns localized section titles & eyebrows
 */
export function getLocalizedSectionHeader(text, locale = 'en') {
  if (locale !== 'hi' || !text) return text || '';
  return sectionHeadersHi[text] || text;
}
