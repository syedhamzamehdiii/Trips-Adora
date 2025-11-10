/**
 * Utility to sync existing localStorage products to the database
 * Run this in browser console or add to a migration page
 */
import productService from '@/services/productService';

export const syncLocalStorageProductsToDatabase = async () => {
  try {
    const allProductsData = localStorage.getItem('all_products');
    if (!allProductsData) {
      console.log('No products in localStorage to sync');
      return { synced: 0, errors: 0 };
    }

    const products = JSON.parse(allProductsData);
    const publishedProducts = products.filter(p => p.status === 'Published');
    
    console.log(`Found ${publishedProducts.length} published products to sync`);
    
    let synced = 0;
    let errors = 0;

    for (const product of publishedProducts) {
      try {
        // Get full product data
        const fullDataKey = `product_full_${product.id}`;
        const fullData = localStorage.getItem(fullDataKey);
        
        if (!fullData) {
          console.warn(`No full data found for product ${product.id}, skipping`);
          errors++;
          continue;
        }

        const productData = JSON.parse(fullData);
        
        // Check if already synced (has dbProductId)
        if (productData.dbProductId) {
          console.log(`Product ${product.id} already synced (dbProductId: ${productData.dbProductId})`);
          continue;
        }

        // Transform to API format
        const apiProductData = {
          title: productData.productTitle || product.name || 'Untitled Product',
          category: productData.productCategory || 'tour',
          tagline: productData.tagline || '',
          description: productData.description || 'No description provided',
          highlights: Array.isArray(productData.highlights) ? productData.highlights.map(h => ({
            icon: h.icon || 'mountain',
            text: h.text || ''
          })) : [],
          images: [],
          hero_image: null,
          gallery_images: [],
          itinerary: Array.isArray(productData.itineraries) ? productData.itineraries.map(item => ({
            time: item.time || '',
            title: item.title || '',
            description: item.description || '',
            icon: item.icon || 'sightseeing'
          })) : [],
          duration: productData.duration || '',
          guide_type: productData.selectedGuideType || '',
          activity_type: productData.selectedActivityType || '',
          languages: Array.isArray(productData.selectedLanguages) ? productData.selectedLanguages : [],
          things_to_carry: Array.isArray(productData.selectedThingsToCarry) ? productData.selectedThingsToCarry : [],
          included_excluded: {
            included: Array.isArray(productData.includedItems) ? productData.includedItems : 
                     (productData.includedItems ? [productData.includedItems] : []),
            excluded: Array.isArray(productData.excludedItems) ? productData.excludedItems : 
                     (productData.excludedItems ? [productData.excludedItems] : [])
          },
          accessibility: productData.accessibilityToggles || {},
          vehicle_details: productData.vehicles?.[0] ? {
            vehicle_type: productData.vehicles[0].type || 'car',
            vehicle_model: productData.vehicles[0].model || '',
            capacity: productData.vehicles[0].capacity || null
          } : null,
          pickup_dropoff: {
            pickup_location: productData.selectedPickupLocations?.[0] || '',
            dropoff_location: productData.selectedDropoffLocations?.[0] || '',
            pickup_time: productData.pickupTime || '',
            available_days: productData.selectedWeekDay ? [productData.selectedWeekDay] : [],
            available_time_slots: productData.timeSlots ? Object.keys(productData.timeSlots) : []
          },
          price: parseFloat(product.revenue || productData.vehicles?.[0]?.amount || 0),
          currency: 'USD',
          price_unit: 'Per Group',
          destination: productData.destination || '',
          breadcrumb: [],
          selling_points: Array.isArray(productData.sellingPoints) ? productData.sellingPoints : 
                         (productData.sellingPoints ? [productData.sellingPoints] : []),
          style_theme: productData.styleTheme || '',
          faqs: []
        };

        // Create product in database
        // NOTE: Products are now auto-published on creation (bypassing admin approval temporarily)
        const createdProduct = await productService.createProduct(apiProductData);
        const dbProductId = createdProduct.id;
        
        // NOTE: Products are auto-published on creation, so this is optional but kept for compatibility
        // TODO: When admin panel is implemented, this explicit publish will be required after admin approval
        await productService.publishProduct(dbProductId);
        
        // Update localStorage with database ID
        productData.dbProductId = dbProductId;
        localStorage.setItem(fullDataKey, JSON.stringify(productData));
        
        // Update product in all_products array
        const productIndex = products.findIndex(p => p.id === product.id);
        if (productIndex >= 0) {
          products[productIndex].dbProductId = dbProductId;
        }
        
        synced++;
        console.log(`✅ Synced product "${product.name}" to database (ID: ${dbProductId})`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error syncing product ${product.id}:`, error);
        errors++;
      }
    }

    // Save updated products array
    localStorage.setItem('all_products', JSON.stringify(products));
    
    console.log(`\n✅ Sync complete: ${synced} synced, ${errors} errors`);
    return { synced, errors };
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    return { synced: 0, errors: 1 };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.syncProductsToDatabase = syncLocalStorageProductsToDatabase;
}

