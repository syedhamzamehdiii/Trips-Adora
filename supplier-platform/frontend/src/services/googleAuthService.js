// Google OAuth Service for handling Google authentication
import { googleConfig } from '@/config'

class GoogleAuthService {
  constructor() {
    this.clientId = googleConfig.clientId
    this.redirectUri = googleConfig.redirectUri
    this.scope = googleConfig.scope
  }

  // Initialize Google OAuth
  initGoogleAuth() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        resolve()
        return
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        // Script is loading, wait for it
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.accounts && window.google.accounts.id) {
            clearInterval(checkGoogle)
            resolve()
          }
        }, 100)
        
        setTimeout(() => {
          clearInterval(checkGoogle)
          reject(new Error('Google OAuth script loading timeout'))
        }, 10000)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: (response) => {
              // This callback is handled by the component directly
              console.log("Google GSI callback triggered, but handled by component.")
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          })
          resolve()
        } else {
          reject(new Error('Failed to load Google OAuth script'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load Google OAuth script'))
      document.head.appendChild(script)
    })
  }

  // Handle credential response from Google
  handleCredentialResponse = (response) => {
    try {
      const credential = response.credential
      const decoded = this.decodeJWT(credential)
      return { success: true, credential, user: decoded }
    } catch (error) {
      console.error('Error decoding Google credential:', error)
      return { success: false, error: 'Invalid Google credential' }
    }
  }

  // Simple JWT decode (for demo purposes - in production use a proper library)
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('JWT decode error:', error)
      throw error
    }
  }

  // Launch Google One-Tap or Popup for authentication
  launchGoogleAuth() {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        reject(new Error('Google GSI client not initialized.'))
        return
      }

      const handleAuthResult = (response) => {
        const result = this.handleCredentialResponse(response)
        if (result.success) {
          resolve(result)
        } else {
          reject(new Error(result.error || 'Google authentication failed.'))
        }
      }

      // Use a temporary global callback for this specific request
      window.googleAuthCallback = handleAuthResult;

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if one-tap is not displayed or skipped
          const tempDiv = document.createElement('div');
          document.body.appendChild(tempDiv);
          window.google.accounts.id.renderButton(
            tempDiv,
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              locale: 'en',
              callback: (response) => {
                document.body.removeChild(tempDiv);
                resolve(response);
              }
            }
          );
          // Programmatically click the rendered button to trigger the popup
          const button = tempDiv.querySelector('div[data-g_id_onload]');
          if (button) {
            button.click();
          } else {
            reject(new Error('Google button rendering failed.'));
          }
        } else if (notification.isDisplayed()) {
          // One-tap is displayed, wait for user interaction
          window.googleAuthCallback = (response) => resolve(response);
        } else {
          reject(new Error('Google One-Tap failed to display.'));
        }
      });
    });
  }

  // Sign out from Google
  signOut() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }
}

const googleAuthService = new GoogleAuthService()
export default googleAuthService