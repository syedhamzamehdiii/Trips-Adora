// Test script to verify real-time dashboard functionality
// Run this in browser console to test all real-time features

export const testRealtimeDashboard = () => {
  console.log('🧪 Testing Real-time Dashboard Functionality...\n');

  // Test 1: Supplier Mode Toggle
  console.log('1️⃣ Testing Supplier Mode Toggle:');
  const initialMode = localStorage.getItem('supplier_mode');
  console.log(`   Initial mode: ${initialMode}`);
  
  // Toggle mode
  localStorage.setItem('supplier_mode', JSON.stringify(false));
  window.dispatchEvent(new Event('supplier_mode_updated'));
  console.log('   ✅ Toggled to Customer mode');
  
  // Reset
  localStorage.setItem('supplier_mode', JSON.stringify(true));
  window.dispatchEvent(new Event('supplier_mode_updated'));
  console.log('   ✅ Reset to Supplier mode\n');

  // Test 2: Dashboard Data Updates
  console.log('2️⃣ Testing Dashboard Data Updates:');
  const testData = {
    balance: 2500,
    todaysBookings: 25,
    tomorrowsBookings: 30,
    cancellationRate: 5,
    freshReviews: 4.9,
    todaysBalance: 1200,
    myActivity: {
      published: 60,
      drafts: 25,
      underReview: 15
    },
    accountStability: {
      positiveRating: 80,
      cancellation: 15,
      negativeRating: 5
    }
  };
  
  localStorage.setItem('dashboard_data', JSON.stringify(testData));
  window.dispatchEvent(new Event('dashboard_data_updated'));
  console.log('   ✅ Updated dashboard data');
  console.log('   📊 New values:', testData);

  // Test 3: Profile Data Updates
  console.log('\n3️⃣ Testing Profile Data Updates:');
  const testProfile = {
    editableInfo: {
      publicName: 'Test User',
      city: 'Tokyo',
      country: 'Japan'
    },
    globalUserPhoto: 'data:image/jpeg;base64,test-image-data',
    profileData: {
      contactValue: '12345678'
    }
  };
  
  localStorage.setItem('account_settings', JSON.stringify(testProfile));
  window.dispatchEvent(new Event('account_settings_updated'));
  console.log('   ✅ Updated profile data');
  console.log('   👤 New profile:', testProfile.editableInfo);

  // Test 4: Product Data Integration
  console.log('\n4️⃣ Testing Product Data Integration:');
  const testProducts = [
    { id: 1, status: 'Published', name: 'Product 1' },
    { id: 2, status: 'Published', name: 'Product 2' },
    { id: 3, status: 'Draft', name: 'Product 3' },
    { id: 4, status: 'Under Review', name: 'Product 4' }
  ];
  
  localStorage.setItem('all_products', JSON.stringify(testProducts));
  window.dispatchEvent(new Event('dashboard_data_updated'));
  console.log('   ✅ Updated product data');
  console.log('   📦 Products:', testProducts.length);
  console.log('   📈 Activity should be: Published 50%, Drafts 25%, Under Review 25%');

  console.log('\n🎉 All tests completed! Check the dashboard for real-time updates.');
  console.log('💡 Use the "Show Admin" button to manually test data changes.');
};

// Auto-run test if in browser console
if (typeof window !== 'undefined') {
  window.testRealtimeDashboard = testRealtimeDashboard;
  console.log('🔧 Real-time dashboard test loaded. Run testRealtimeDashboard() to test.');
}
