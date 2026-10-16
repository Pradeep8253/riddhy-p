export const messages={
  en:{furniture:'Furniture',appliances:'Appliances',rooms:'Shop by room',offers:'Offers',trade:'Trade & bulk',story:'Our story',search:'Search sofas, fridges, more…',wishlist:'Wishlist',account:'Your account',bag:'Bag',addToBag:'Add to bag',shopFurniture:'Shop furniture',shopAppliances:'Shop appliances',explore:'Explore',reduceMotion:'Reduce motion / Lite mode',liteOn:'Lite mode on',home:'Home',support:'Support'},
  hi:{furniture:'फ़र्नीचर',appliances:'घरेलू उपकरण',rooms:'कमरे के अनुसार',offers:'ऑफ़र',trade:'थोक एवं व्यापार',story:'हमारी कहानी',search:'सोफ़ा, फ़्रिज और बहुत कुछ खोजें…',wishlist:'पसंदीदा',account:'आपका खाता',bag:'बैग',addToBag:'बैग में जोड़ें',shopFurniture:'फ़र्नीचर देखें',shopAppliances:'उपकरण देखें',explore:'देखें',reduceMotion:'कम गति / लाइट मोड',liteOn:'लाइट मोड चालू',home:'होम',support:'सहायता'}
};
export function tr(locale,key){return messages[locale]?.[key]||messages.en[key]||key;}
