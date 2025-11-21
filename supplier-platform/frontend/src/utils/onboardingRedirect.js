const setStorageFlag = (key, value) => {
  try {
    localStorage.setItem(key, value)
    sessionStorage.setItem(key, value)
  } catch (error) {
    console.warn(`Unable to update ${key}`, error)
  }
}

export const markSupplierOnboardingVerified = () => {
  setStorageFlag('supplier_onboarding_status', 'verified')
  setStorageFlag('supplier_requires_self_verification', 'false')
}

export const redirectToSupplierOnboarding = () => {
  // Until admin verification flow is wired, auto-mark suppliers as verified
  markSupplierOnboardingVerified()
  return false
}

