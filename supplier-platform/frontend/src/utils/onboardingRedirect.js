const CUSTOMER_APP_URL =
  (import.meta?.env?.VITE_CUSTOMER_APP_URL || 'http://localhost:5174').replace(/\/$/, '')

export const redirectToSupplierOnboarding = () => {
  try {
    const storedStatus =
      localStorage.getItem('supplier_onboarding_status') ||
      sessionStorage.getItem('supplier_onboarding_status')

    if (storedStatus === 'verified') {
      return false
    }

    if (!storedStatus) {
      localStorage.setItem('supplier_onboarding_status', 'onboarding')
      sessionStorage.setItem('supplier_onboarding_status', 'onboarding')
    }
  } catch (error) {
    console.warn('Unable to access supplier onboarding status', error)
  }

  window.location.assign(`${CUSTOMER_APP_URL}/supplier-registration`)
  return true
}

