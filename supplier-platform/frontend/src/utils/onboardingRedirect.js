// Placeholder helpers for future onboarding redirects.
// Now that admin approval is required, we no longer auto-mark suppliers
// as verified or bypass onboarding flows.
export const markSupplierOnboardingVerified = () => {
  try {
    localStorage.setItem('supplier_onboarding_status', 'pending_admin_review')
    sessionStorage.setItem('supplier_onboarding_status', 'pending_admin_review')
    localStorage.setItem('supplier_requires_self_verification', 'true')
    sessionStorage.setItem('supplier_requires_self_verification', 'true')
  } catch (error) {
    console.warn('Unable to update onboarding flags', error)
  }
}

export const redirectToSupplierOnboarding = () => {
  // No auto-verification; allow caller to decide next step (e.g., show banner).
  return false
}

