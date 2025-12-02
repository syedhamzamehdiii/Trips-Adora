
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import {Check ,ChevronDown, Instagram, Linkedin, Facebook, Twitter, Globe, DollarSign, ShieldCheck, UsersRound, Phone, Headphones, Star, MessageCircle, MessageSquareText, MapPin, Clock, Droplet, UserPlus, Heart, ArrowUpRight, GitBranch, Map as MapIcon, ChevronLeft, ChevronRight, X, Plus, Minus, AlertTriangle, Car } from 'lucide-react'
import Itinerary from "../components/Itinerary"
import share from "../../assests/share.png";
import branch from "../../assests/middle.png";
import Footer from './Footer'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MainHeader from './MainHeader'
import TourCard from './TourCard'
import ClimateWidget from './ClimateWidget'
import SupplierChatModal from './SupplierChatModal'
import CancellationPolicyModal from './CancellationPolicyModal'
import { getPublishedProducts, transformProductForFrontend, addRecentlyViewed, recordProductClick, getProductClicks, getProductById, getCachedPublishedProductsSync } from '../services/productService'
import { ensureProductLocationResolved } from '../services/climateService'

const ProductDetails = () => {
  const navigate = useNavigate()
  const { slug, id } = useParams()
  // Get identifier from either slug (for /tours/:slug) or id (for /product-details/:id)
  const identifier = slug || id
  
  // Instant render from cached list (no spinner) - memoized to avoid re-calculation every render
  const initialFromCache = useMemo(() => {
    try {
      const cache = getCachedPublishedProductsSync().map(transformProductForFrontend)
      const normalize = (name) => String(name || '').toLowerCase().replace(/\s+/g,'-')
      return cache.find(p => normalize(p.name) === String((identifier || '')).toLowerCase() || String(p.id) === String(identifier)) || null
    } catch {
      return null
    }
  }, [identifier])

  const [product, setProduct] = useState(initialFromCache)
  const hasLoadedOnceRef = useRef(!!initialFromCache)
  const [loading, setLoading] = useState(!initialFromCache) // Only show loading if no cached data
  const [recommended, setRecommended] = useState([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClimateOpen, setIsClimateOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [imagesLoaded, setImagesLoaded] = useState(new Set())
  const [showAllImages, setShowAllImages] = useState(false)
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false)
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(null)
  const [selectedMeetingPointIndex, setSelectedMeetingPointIndex] = useState(null)
  const quickDetailRef = useRef(null)

  const handleScrollToQuickDetail = useCallback(() => {
    if (quickDetailRef.current) {
      quickDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (typeof quickDetailRef.current.focus === 'function') {
        quickDetailRef.current.focus()
      }
    }
  }, [])

  const images = useMemo(() => {
    if (!product) return []
    // Only use images from product data - no fallback images
    const imgs = Array.isArray(product.images) ? product.images : []
    const main = product.image ? [product.image] : []
    // de-dup main
    const others = imgs.filter(src => src !== product.image)
    const allImages = [...main, ...others].filter(img => img && img.trim() !== '')
    return allImages
  }, [product])

  const openGalleryAt = (index) => { setCurrentIndex(index); setIsGalleryOpen(true) }
  const closeGallery = () => setIsGalleryOpen(false)

  // Reset image errors when product changes
  useEffect(() => {
    setImageErrors(new Set())
    setImagesLoaded(new Set())
    setIsPolicyModalOpen(false)
  }, [product?.id])

  useEffect(() => {
    if (Array.isArray(product?.vehicles) && product.vehicles.length > 0) {
      setSelectedVehicleIndex((prev) => {
        if (prev === null || prev >= product.vehicles.length) {
          return 0
        }
        return prev
      })
    } else {
      setSelectedVehicleIndex(null)
    }
  }, [product?.vehicles])

  // Reset selected meeting point when vehicle changes
  useEffect(() => {
    setSelectedMeetingPointIndex(null)
  }, [selectedVehicleIndex])

  const selectedVehicle = useMemo(() => {
    if (!Array.isArray(product?.vehicles) || selectedVehicleIndex === null) return null
    return product.vehicles[selectedVehicleIndex] || null
  }, [product?.vehicles, selectedVehicleIndex])

  // Calculate tour time range from pickup time + vehicle duration
  const calculateTourTimeRange = useCallback((pickupTime, duration) => {
    if (!pickupTime) return null
    
    // Parse pickup time (format: "HH:MM" or "HH:MM:SS")
    const pickupParts = pickupTime.split(':').map(Number)
    if (pickupParts.length < 2 || isNaN(pickupParts[0]) || isNaN(pickupParts[1])) {
      console.warn('Invalid pickup time format:', pickupTime)
      return null
    }
    
    let pickupHours = pickupParts[0]
    let pickupMinutes = pickupParts[1]
    
    // Validate pickup time
    if (pickupHours < 0 || pickupHours >= 24 || pickupMinutes < 0 || pickupMinutes >= 60) {
      console.warn('Invalid pickup time values:', { pickupHours, pickupMinutes })
      return null
    }
    
    // Parse duration to hours
    let durationHours = 0
    if (duration) {
      const durationStr = String(duration).trim().toLowerCase()
      
      // Handle "Full Day" - typically 12 hours (6 AM to 6 PM, or until next day)
      if (durationStr === 'full day' || durationStr === 'fullday' || durationStr === 'full-day') {
        durationHours = 12
      } else {
        // Extract hours from formats like "7h", "7 hours", "7", "7.5h", etc.
        const hourMatch = durationStr.match(/(\d+\.?\d*)\s*h/i)
        if (hourMatch) {
          durationHours = parseFloat(hourMatch[1])
        } else {
          // Try parsing as plain number (assume hours)
          const num = parseFloat(durationStr)
          if (!isNaN(num) && num > 0) {
            durationHours = num
          }
        }
      }
    }
    
    if (durationHours <= 0) {
      console.warn('Invalid or missing duration:', duration)
      return null
    }
    
    // Calculate end time
    let endHours = pickupHours + Math.floor(durationHours)
    let endMinutes = pickupMinutes + Math.round((durationHours % 1) * 60)
    
    // Handle minute overflow
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60)
      endMinutes = endMinutes % 60
    }
    
    // Handle hour overflow (next day) - wrap around at 24 hours
    if (endHours >= 24) {
      endHours = endHours % 24
    }
    
    // Format times (HH:MM)
    const formatTime = (hours, mins) => {
      const h = Math.floor(hours).toString().padStart(2, '0')
      const m = Math.floor(mins).toString().padStart(2, '0')
      return `${h}:${m}`
    }
    
    const startTimeFormatted = formatTime(pickupHours, pickupMinutes)
    const endTimeFormatted = formatTime(endHours, endMinutes)
    
    return `${startTimeFormatted} - ${endTimeFormatted}`
  }, [])

  // Get pickup configurations for selected vehicle
  const selectedVehiclePickupConfigs = useMemo(() => {
    if (!selectedVehicle) {
      return []
    }
    
    // Debug: Log what we have (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Finding pickup configs for vehicle:', {
        selectedVehicleId: selectedVehicle.id || selectedVehicle._id,
        selectedVehicleTitle: selectedVehicle.title || selectedVehicle.model,
        selectedVehicleIndex,
        selectedVehicle: selectedVehicle,
        hasPickupDropoff: !!product?.pickup_dropoff,
        hasPickupConfigs: !!product?.pickup_dropoff?.pickup_configurations,
        configsCount: product?.pickup_dropoff?.pickup_configurations?.length || 0,
        pickupDropoffKeys: product?.pickup_dropoff ? Object.keys(product.pickup_dropoff) : [],
        pickupDropoffFull: product?.pickup_dropoff,
        hasCustomFields: !!product?.custom_fields,
        hasVehicleTimeAllocations: !!(product?.custom_fields?.vehicle_time_allocations),
        vehicleTimeAllocationsCount: Array.isArray(product?.custom_fields?.vehicle_time_allocations) 
          ? product.custom_fields.vehicle_time_allocations.length 
          : 0,
        allVehicles: product?.vehicles?.map((v, idx) => ({
          index: idx,
          id: v.id || v._id,
          title: v.title || v.model,
          isSelected: idx === selectedVehicleIndex
        })) || []
      })
      
      // Log the actual pickup_dropoff structure
      if (product?.pickup_dropoff) {
        console.log('📦 pickup_dropoff structure:', JSON.stringify(product.pickup_dropoff, null, 2))
      }
      
      // Log custom_fields if it exists
      if (product?.custom_fields) {
        console.log('📦 custom_fields keys:', Object.keys(product.custom_fields))
        if (product.custom_fields.vehicle_time_allocations) {
          console.log('📦 vehicle_time_allocations:', product.custom_fields.vehicle_time_allocations)
        }
      }
    }
    
    // First try pickup_configurations from pickup_dropoff
    if (product?.pickup_dropoff?.pickup_configurations && Array.isArray(product.pickup_dropoff.pickup_configurations)) {
      const configs = product.pickup_dropoff.pickup_configurations
      if (configs.length > 0) {
        // Match configurations by vehicle_id, vehicle.id, or vehicle title/model
        const vehicleId = selectedVehicle.id || selectedVehicle._id
        const vehicleTitle = selectedVehicle.title || selectedVehicle.model
        const vehicleModel = selectedVehicle.model || selectedVehicle.title
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Available configs:', configs.map((c, idx) => ({
            index: idx,
            vehicle_id: c.vehicle_id,
            vehicle: c.vehicle ? {
              id: c.vehicle.id || c.vehicle._id,
              _id: c.vehicle._id,
              title: c.vehicle.title,
              model: c.vehicle.model
            } : null,
            pickup_location: c.pickup_location,
            pickup_time: c.pickup_time
          })))
        }
        
        const matched = configs.filter((config, configIndex) => {
          let matchedBy = null
          
          // Match by vehicle_id (direct comparison) - if both exist
          if (config.vehicle_id && vehicleId) {
            if (String(config.vehicle_id) === String(vehicleId)) {
              matchedBy = 'vehicle_id'
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Matched by vehicle_id:', config.vehicle_id, '===', vehicleId)
              }
              return true
            }
          }
          
          // Match by vehicle.id in config.vehicle object
          if (config.vehicle?.id && vehicleId) {
            if (String(config.vehicle.id) === String(vehicleId)) {
              matchedBy = 'vehicle.id'
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Matched by config.vehicle.id:', config.vehicle.id, '===', vehicleId)
              }
              return true
            }
          }
          
          // Match by vehicle._id in config.vehicle object
          if (config.vehicle?._id && vehicleId) {
            if (String(config.vehicle._id) === String(vehicleId)) {
              matchedBy = 'vehicle._id'
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Matched by config.vehicle._id:', config.vehicle._id, '===', vehicleId)
              }
              return true
            }
          }
          
          // IMPORTANT: Match by vehicle title/model (case-insensitive) - works even without IDs
          // This is the primary matching method when vehicles don't have IDs
          // Check both title and model separately to handle cases where one matches but the other doesn't
          if (vehicleTitle || vehicleModel) {
            // Check config.vehicle object first
            if (config.vehicle) {
              // Check if config.vehicle.title matches selected vehicle title or model
              if (config.vehicle.title) {
                const configTitleNormalized = String(config.vehicle.title).toLowerCase().trim()
                if (vehicleTitle) {
                  const vehicleTitleNormalized = String(vehicleTitle).toLowerCase().trim()
                  if (configTitleNormalized === vehicleTitleNormalized) {
                    matchedBy = 'title'
                    if (process.env.NODE_ENV === 'development') {
                      console.log('✅ Matched by title in config.vehicle:', config.vehicle.title, '===', vehicleTitle)
                    }
                    return true
                  }
                }
                if (vehicleModel) {
                  const vehicleModelNormalized = String(vehicleModel).toLowerCase().trim()
                  if (configTitleNormalized === vehicleModelNormalized) {
                    matchedBy = 'title (matches model)'
                    if (process.env.NODE_ENV === 'development') {
                      console.log('✅ Matched by title (matches model) in config.vehicle:', config.vehicle.title, '===', vehicleModel)
                    }
                    return true
                  }
                }
              }
              
              // Check if config.vehicle.model matches selected vehicle title or model
              // IMPORTANT: Model matching is less precise, so we should be more careful
              if (config.vehicle.model) {
                const configModelNormalized = String(config.vehicle.model).toLowerCase().trim()
                if (vehicleTitle) {
                  const vehicleTitleNormalized = String(vehicleTitle).toLowerCase().trim()
                  if (configModelNormalized === vehicleTitleNormalized) {
                    matchedBy = 'model (matches title)'
                    if (process.env.NODE_ENV === 'development') {
                      console.log('✅ Matched by model (matches title) in config.vehicle:', config.vehicle.model, '===', vehicleTitle)
                    }
                    return true
                  }
                }
                if (vehicleModel) {
                  const vehicleModelNormalized = String(vehicleModel).toLowerCase().trim()
                  if (configModelNormalized === vehicleModelNormalized) {
                    // CRITICAL: When matching by model, we need to verify it's the exact same vehicle
                    // Check if the config's vehicle ID matches what we're looking for (if we have an ID)
                    // OR check if the title also matches to avoid false positives
                    if (vehicleId) {
                      // If we have a vehicle ID, we should have matched by ID above
                      // This model match is only valid if IDs don't exist
                      matchedBy = 'model'
                      if (process.env.NODE_ENV === 'development') {
                        console.log('✅ Matched by model in config.vehicle:', config.vehicle.model, '===', vehicleModel, '(ID check: vehicleId exists but config has different/no ID)')
                      }
                      return true
                    } else {
                      // No ID available - model match might be ambiguous, but proceed
                      // We'll filter duplicates later
                      matchedBy = 'model'
                      if (process.env.NODE_ENV === 'development') {
                        console.log('✅ Matched by model in config.vehicle:', config.vehicle.model, '===', vehicleModel, '(no ID available)')
                      }
                      return true
                    }
                  }
                }
              }
            }
            
            // Also check if vehicle_id is actually a title (string match)
            if (config.vehicle_id && typeof config.vehicle_id === 'string') {
              const vehicleIdNormalized = String(config.vehicle_id).toLowerCase().trim()
              const vehicleTitleNormalized = String(vehicleTitle).toLowerCase().trim()
              if (vehicleIdNormalized === vehicleTitleNormalized) {
                matchedBy = 'vehicle_id as title'
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Matched by vehicle_id string (title):', config.vehicle_id, '===', vehicleTitle)
                }
                return true
              }
            }
          }
          
          // STRICT Fallback: Match by position if model matching found multiple matches
          // Use array index as tiebreaker when vehicles have same model but different IDs
          if (selectedVehicleIndex !== null && 
              configs.length > 0 &&
              product?.vehicles &&
              selectedVehicleIndex < configs.length &&
              configIndex === selectedVehicleIndex) {
            // Use array position if:
            // 1. We matched by model (which is ambiguous), OR
            // 2. No ID available and we're matching by model
            if (!vehicleId || (vehicleModel && matchedBy && matchedBy.includes('model'))) {
              matchedBy = 'array position (tiebreaker for model match)'
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Using array position as tiebreaker for model match:', configIndex, 'for vehicle index:', selectedVehicleIndex)
              }
              return true
            }
          }
          
          if (process.env.NODE_ENV === 'development' && !matchedBy) {
            // Log why this config didn't match (only for debugging)
            console.log('❌ Config did not match:', {
              configIndex,
              configVehicleId: config.vehicle_id,
              configVehicleTitle: config.vehicle?.title || config.vehicle?.model,
              selectedVehicleId: vehicleId,
              selectedVehicleTitle: vehicleTitle,
              pickupLocation: config.pickup_location,
              pickupTime: config.pickup_time
            })
          }
          
          return false
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🎯 Matched configs for vehicle:', {
            selectedVehicleTitle: vehicleTitle,
            selectedVehicleId: vehicleId,
            selectedVehicleIndex,
            matchedCount: matched.length,
            matchedConfigs: matched.map(m => ({
              vehicle_id: m.vehicle_id,
              vehicle_title: m.vehicle?.title || m.vehicle?.model,
              pickup_location: m.pickup_location,
              pickup_time: m.pickup_time
            })),
            allConfigsCount: configs.length,
            allConfigs: configs.map((c, idx) => ({
              index: idx,
              vehicle_id: c.vehicle_id,
              vehicle_title: c.vehicle?.title || c.vehicle?.model,
              pickup_location: c.pickup_location,
              pickup_time: c.pickup_time
            }))
          })
        }
        
        if (matched.length > 0) {
          // CRITICAL: Double-check that all matched configs actually belong to the selected vehicle
          // This prevents showing configs from other vehicles if matching logic was too broad
          const verifiedMatches = matched.filter(config => {
            // Verify by vehicle_id
            if (config.vehicle_id && vehicleId && String(config.vehicle_id) === String(vehicleId)) {
              return true
            }
            // Verify by vehicle.id
            if (config.vehicle?.id && vehicleId && String(config.vehicle.id) === String(vehicleId)) {
              return true
            }
            // Verify by vehicle._id
            if (config.vehicle?._id && vehicleId && String(config.vehicle._id) === String(vehicleId)) {
              return true
            }
            // Verify by title/model - check both title and model separately
            if (config.vehicle) {
              // Check if config.vehicle.title matches selected vehicle title or model
              if (config.vehicle.title) {
                const configTitleNormalized = String(config.vehicle.title).toLowerCase().trim()
                if (vehicleTitle && String(vehicleTitle).toLowerCase().trim() === configTitleNormalized) {
                  return true
                }
                if (vehicleModel && String(vehicleModel).toLowerCase().trim() === configTitleNormalized) {
                  return true
                }
              }
              // Check if config.vehicle.model matches selected vehicle title or model
              if (config.vehicle.model) {
                const configModelNormalized = String(config.vehicle.model).toLowerCase().trim()
                if (vehicleTitle && String(vehicleTitle).toLowerCase().trim() === configModelNormalized) {
                  return true
                }
                if (vehicleModel && String(vehicleModel).toLowerCase().trim() === configModelNormalized) {
                  return true
                }
              }
            }
            // Verify by vehicle_id as title
            if (vehicleTitle && config.vehicle_id && typeof config.vehicle_id === 'string') {
              if (String(config.vehicle_id).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
                return true
              }
            }
            // If we matched by array position (last resort), verify it still matches
            if (selectedVehicleIndex !== null && configs.length === product?.vehicles?.length) {
              const configIndex = configs.indexOf(config)
              if (configIndex === selectedVehicleIndex) {
                return true
              }
            }
            return false
          })
          
          if (process.env.NODE_ENV === 'development' && verifiedMatches.length !== matched.length) {
            console.warn('⚠️ Some matched configs were filtered out during verification:', {
              originalCount: matched.length,
              verifiedCount: verifiedMatches.length,
              filtered: matched.length - verifiedMatches.length
            })
          }
          
          // CRITICAL: Final safety check - ensure all matched configs belong to the same vehicle
          // If we have multiple matches, verify they all reference the same vehicle
          if (verifiedMatches.length > 1) {
            // First, try to match by vehicle ID if available
            if (vehicleId) {
              const idMatches = verifiedMatches.filter(config => {
                const configVehicleId = config.vehicle_id || config.vehicle?.id || config.vehicle?._id
                return configVehicleId && String(configVehicleId) === String(vehicleId)
              })
              if (idMatches.length > 0) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Filtered matches by vehicle ID:', idMatches.length, 'out of', verifiedMatches.length)
                }
                return idMatches
              }
            }
            
            // Second, try to match by exact title if available
            if (vehicleTitle && selectedVehicle?.title) {
              const titleMatches = verifiedMatches.filter(config => {
                const configTitle = config.vehicle?.title
                return configTitle && String(configTitle).toLowerCase().trim() === String(selectedVehicle.title).toLowerCase().trim()
              })
              if (titleMatches.length > 0) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Filtered matches by exact title:', titleMatches.length, 'out of', verifiedMatches.length)
                }
                return titleMatches
              }
            }
            
            // Third, check if all matches belong to the same vehicle by ID
            const firstConfigVehicleId = verifiedMatches[0].vehicle_id || verifiedMatches[0].vehicle?.id || verifiedMatches[0].vehicle?._id
            if (firstConfigVehicleId) {
              const sameVehicleMatches = verifiedMatches.filter(config => {
                const configVehicleId = config.vehicle_id || config.vehicle?.id || config.vehicle?._id
                return configVehicleId && String(configVehicleId) === String(firstConfigVehicleId)
              })
              if (sameVehicleMatches.length > 0 && sameVehicleMatches.length < verifiedMatches.length) {
                if (process.env.NODE_ENV === 'development') {
                  console.warn('⚠️ Filtered to configs from same vehicle ID:', sameVehicleMatches.length, 'out of', verifiedMatches.length)
                }
                return sameVehicleMatches
              }
            }
            
            // Fourth, if no ID and multiple matches by model, use array index as tiebreaker
            if (!vehicleId && selectedVehicleIndex !== null && verifiedMatches.length > 1) {
              // Strategy: Match the config at the same index position as the selected vehicle
              // This works when vehicles array order corresponds to unique vehicles in pickup_configurations
              
              // Try to find the vehicle's ID from the vehicles array at the selected index
              const selectedVehicleFromArray = product?.vehicles?.[selectedVehicleIndex]
              if (selectedVehicleFromArray) {
                const selectedVehicleIdFromArray = selectedVehicleFromArray.id || selectedVehicleFromArray._id
                
                // If we can find the ID from the vehicle object, use it
                if (selectedVehicleIdFromArray) {
                  const idMatches = verifiedMatches.filter(config => {
                    const configVehicleId = config.vehicle_id || config.vehicle?.id || config.vehicle?._id
                    return configVehicleId && String(configVehicleId) === String(selectedVehicleIdFromArray)
                  })
                  if (idMatches.length > 0) {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('✅ Found vehicle ID from array, using it to filter:', idMatches.length, 'config(s)')
                    }
                    return idMatches
                  }
                }
              }
              
              // Fallback: Use array index to pick the correct matching config
              // If vehicle at index 0, use first match; if index 1, use second match, etc.
              if (verifiedMatches.length > 0 && selectedVehicleIndex !== null && selectedVehicleIndex < verifiedMatches.length) {
                // Use the match at the selectedVehicleIndex position
                const indexMatch = [verifiedMatches[selectedVehicleIndex]]
                if (process.env.NODE_ENV === 'development') {
                  console.log(`✅ Using matching config at index ${selectedVehicleIndex} as tiebreaker:`, indexMatch[0]?.vehicle?.title || indexMatch[0]?.vehicle?.model)
                }
                return indexMatch
              } else if (verifiedMatches.length > 0) {
                // Last resort: use first match
                const firstMatch = [verifiedMatches[0]]
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Using first matching config as tiebreaker (no ID available):', firstMatch[0]?.vehicle?.title || firstMatch[0]?.vehicle?.model)
                }
                return firstMatch
              }
            }
            
            // Fourth, check by title/model combination
            const firstConfigVehicleRef = verifiedMatches[0].vehicle_id || verifiedMatches[0].vehicle?.id || verifiedMatches[0].vehicle?._id || verifiedMatches[0].vehicle?.title || verifiedMatches[0].vehicle?.model
            const allSameVehicle = verifiedMatches.every(config => {
              const configVehicleRef = config.vehicle_id || config.vehicle?.id || config.vehicle?._id || config.vehicle?.title || config.vehicle?.model
              if (!firstConfigVehicleRef || !configVehicleRef) return true // Skip check if refs are missing
              return String(firstConfigVehicleRef).toLowerCase().trim() === String(configVehicleRef).toLowerCase().trim()
            })
            
            if (!allSameVehicle) {
              if (process.env.NODE_ENV === 'development') {
                console.error('❌ ERROR: Matched configs belong to different vehicles! Using first match only.', {
                  firstConfigVehicle: firstConfigVehicleRef,
                  selectedVehicleId: vehicleId,
                  selectedVehicleTitle: vehicleTitle,
                  allConfigs: verifiedMatches.map(c => ({
                    vehicle_id: c.vehicle_id,
                    vehicle_title: c.vehicle?.title || c.vehicle?.model,
                    vehicle_model: c.vehicle?.model,
                    pickup_location: c.pickup_location,
                    pickup_time: c.pickup_time
                  }))
                })
              }
              // Return only the first match if configs belong to different vehicles
              return [verifiedMatches[0]]
            }
          }
          
          return verifiedMatches
        } else {
          // No match found - log warning in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No matching configs found for vehicle:', {
              vehicleId,
              vehicleTitle,
              vehicleModel,
              selectedVehicleIndex,
              availableConfigs: configs.map((c, idx) => ({
                index: idx,
                vehicle_id: c.vehicle_id,
                vehicle: c.vehicle
              }))
            })
          }
        }
      }
    }
    
    // Fallback: check if there are vehicleTimeAllocations in custom_fields
    // This is for backward compatibility or when data comes from a different source
    const customFields = product?.custom_fields || {}
    const vehicleTimeAllocations = customFields.vehicle_time_allocations || []
    
    if (Array.isArray(vehicleTimeAllocations) && vehicleTimeAllocations.length > 0) {
      // Filter allocations for the selected vehicle
      const vehicleId = selectedVehicle.id || selectedVehicle._id
      const vehicleTitle = selectedVehicle.title || selectedVehicle.model
      
      const matchedAllocations = vehicleTimeAllocations.filter(alloc => {
        // Match by vehicle.id or vehicle_id
        if (vehicleId) {
          const allocVehicleId = alloc.vehicle?.id || alloc.vehicle_id
          if (allocVehicleId && String(allocVehicleId) === String(vehicleId)) {
            return true
          }
        }
        
        // Match by title/model
        if (vehicleTitle) {
          const allocTitle = alloc.vehicle?.title || alloc.vehicle?.model
          if (allocTitle && String(allocTitle).toLowerCase().trim() === String(vehicleTitle).toLowerCase().trim()) {
            return true
          }
        }
        
        // Match by index if arrays are same length
        if (selectedVehicleIndex !== null && 
            vehicleTimeAllocations.length === (product?.vehicles?.length || 0) &&
            vehicleTimeAllocations.indexOf(alloc) === selectedVehicleIndex) {
          return true
        }
        
        return false
      })
      
      if (matchedAllocations.length > 0) {
        // Convert vehicleTimeAllocations format to pickup_configurations format
        const convertedConfigs = matchedAllocations.map(alloc => ({
          pickup_location: Array.isArray(alloc.pickupLocations) 
            ? alloc.pickupLocations.join(', ') 
            : (alloc.pickupLocation || alloc.pickup_location || ''),
          vehicle_id: alloc.vehicle?.id || alloc.vehicle_id || null,
          vehicle: alloc.vehicle || null,
          pickup_time: alloc.time || alloc.pickup_time || '',
          pickup_date: alloc.date || alloc.pickup_date || null,
          pickup_datetime: alloc.datetime || alloc.pickup_datetime || null
        }))
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Found vehicleTimeAllocations in custom_fields, converted to configs:', convertedConfigs)
        }
        
        return convertedConfigs
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Found vehicleTimeAllocations but none matched selected vehicle')
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ No pickup_configurations found in pickup_dropoff and no vehicleTimeAllocations in custom_fields')
    }
    return []
  }, [selectedVehicle, product?.pickup_dropoff?.pickup_configurations, selectedVehicleIndex, product?.vehicles, product?.custom_fields])

  // Get pickup time for selected vehicle (must be declared before selectedVehicleMeetingPoints)
  const selectedVehiclePickupTime = useMemo(() => {
    // Priority 1: First pickup configuration time for selected vehicle
    if (selectedVehiclePickupConfigs.length > 0) {
      const firstConfig = selectedVehiclePickupConfigs[0]
      if (firstConfig?.pickup_time) {
        return firstConfig.pickup_time
      }
    }
    // Priority 2: First pickup configuration time (any vehicle)
    if (product?.pickup_dropoff?.pickup_configurations && 
        Array.isArray(product.pickup_dropoff.pickup_configurations) && 
        product.pickup_dropoff.pickup_configurations.length > 0) {
      const firstConfig = product.pickup_dropoff.pickup_configurations[0]
      if (firstConfig?.pickup_time) {
        return firstConfig.pickup_time
      }
    }
    // Priority 3: Legacy pickupTime field
    if (product?.pickupTime) {
      return product.pickupTime
    }
    // Priority 4: pickup_dropoff.pickup_time
    if (product?.pickup_dropoff?.pickup_time) {
      return product.pickup_dropoff.pickup_time
    }
    return null
  }, [selectedVehiclePickupConfigs, product?.pickup_dropoff?.pickup_configurations, product?.pickupTime, product?.pickup_dropoff?.pickup_time])

  // Get dropoff locations for selected vehicle (similar to meeting points)
  const selectedVehicleDropoffLocations = useMemo(() => {
    const configs = selectedVehiclePickupConfigs;
    
    if (configs.length === 0) {
      // If we have pickup_configurations but none matched, don't show fallback data
      // This ensures we only show vehicle-specific data
      const hasAnyConfigs = product?.pickup_dropoff?.pickup_configurations && 
                            Array.isArray(product.pickup_dropoff.pickup_configurations) &&
                            product.pickup_dropoff.pickup_configurations.length > 0
      
      if (hasAnyConfigs) {
        // We have configs but none matched - return empty to avoid showing wrong data
        return [];
      }
      
      // Only use fallback if we don't have pickup_configurations at all
      // Fallback to product.dropoffLocations or pickupLocations (same as pickup)
      if (Array.isArray(product?.pickup_dropoff?.dropoff_locations) && product.pickup_dropoff.dropoff_locations.length > 0) {
        return product.pickup_dropoff.dropoff_locations.map(loc => ({
          name: typeof loc === 'string' ? loc : (loc.name || loc),
          time: selectedVehiclePickupTime || null,
          address: typeof loc === 'string' ? loc : (loc.address || loc)
        }));
      }
      // If no dropoff locations, use pickup locations (same location)
      if (Array.isArray(product?.pickup_dropoff?.pickup_locations) && product.pickup_dropoff.pickup_locations.length > 0) {
        return product.pickup_dropoff.pickup_locations.map(loc => ({
          name: typeof loc === 'string' ? loc : (loc.name || loc),
          time: selectedVehiclePickupTime || null,
          address: typeof loc === 'string' ? loc : (loc.address || loc)
        }));
      }
      return [];
    }
    
    // Extract unique dropoff locations from configurations
    // Group by location name and collect all times for that location
    const locationsMap = new Map();
    
    configs.forEach(config => {
      // Check if dropoff_location exists and is different from pickup_location
      if (config.dropoff_location && config.dropoff_location !== config.pickup_location) {
        // dropoff_location can be a comma-separated string or single location
        const dropoffLocs = config.dropoff_location.split(',').map(l => l.trim()).filter(Boolean);
        dropoffLocs.forEach(loc => {
          const locationKey = loc.toLowerCase();
          if (!locationsMap.has(locationKey)) {
            locationsMap.set(locationKey, {
              name: loc,
              time: config.pickup_time || null,
              address: config.dropoff_location,
              times: new Set()
            });
          }
          // Add time to the set of times for this location
          if (config.pickup_time) {
            locationsMap.get(locationKey).times.add(config.pickup_time);
          }
        });
      } else {
        // No dropoff_location specified or same as pickup - use pickup locations (same location)
        if (config.pickup_location) {
          const pickupLocs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean);
          pickupLocs.forEach(loc => {
            const locationKey = loc.toLowerCase();
            if (!locationsMap.has(locationKey)) {
              locationsMap.set(locationKey, {
                name: loc,
                time: config.pickup_time || null,
                address: config.pickup_location,
                times: new Set()
              });
            }
            // Add time to the set of times for this location
            if (config.pickup_time) {
              locationsMap.get(locationKey).times.add(config.pickup_time);
            }
          });
        }
      }
    });
    
    // Convert map to array and use the first time for each location
    const locations = Array.from(locationsMap.values()).map(loc => {
      const timeArray = Array.from(loc.times);
      return {
        name: loc.name,
        time: timeArray.length > 0 ? timeArray[0] : loc.time,
        address: loc.address
      };
    });
    
    return locations;
  }, [selectedVehiclePickupConfigs, product?.pickup_dropoff?.dropoff_locations, product?.pickup_dropoff?.pickup_locations, selectedVehiclePickupTime]);

  // Get meeting points (pickup locations) for selected vehicle (must be declared after selectedVehiclePickupTime)
  const selectedVehicleMeetingPoints = useMemo(() => {
    const configs = selectedVehiclePickupConfigs
    
    if (configs.length === 0) {
      // If we have pickup_configurations but none matched, don't show fallback data
      // This ensures we only show vehicle-specific data
      const hasAnyConfigs = product?.pickup_dropoff?.pickup_configurations && 
                            Array.isArray(product.pickup_dropoff.pickup_configurations) &&
                            product.pickup_dropoff.pickup_configurations.length > 0
      
      if (hasAnyConfigs) {
        // We have configs but none matched - return empty to avoid showing wrong data
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ No matching configs found - returning empty meeting points to avoid showing wrong vehicle data')
        }
        return []
      }
      
      // Only use fallback if we don't have pickup_configurations at all
      // Fallback to product.meetingPoints if no configurations exist
      if (Array.isArray(product?.pickup_dropoff?.pickup_locations) && product.pickup_dropoff.pickup_locations.length > 0) {
        return product.pickup_dropoff.pickup_locations.map(loc => ({
          name: typeof loc === 'string' ? loc : (loc.name || loc),
          time: selectedVehiclePickupTime || null,
          address: typeof loc === 'string' ? loc : (loc.address || loc)
        }))
      }
      return Array.isArray(product?.meetingPoints) ? product.meetingPoints : []
    }
    
    // Extract unique pickup locations from configurations
    // Group by location name and collect all times for that location
    const locationsMap = new Map()
    
    configs.forEach(config => {
      if (config.pickup_location) {
        // pickup_location can be a comma-separated string or single location
        const locs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean)
        locs.forEach(loc => {
          const locationKey = loc.toLowerCase()
          if (!locationsMap.has(locationKey)) {
            locationsMap.set(locationKey, {
              name: loc,
              time: config.pickup_time || null,
              address: config.pickup_location,
              times: new Set()
            })
          }
          // Add time to the set of times for this location
          if (config.pickup_time) {
            locationsMap.get(locationKey).times.add(config.pickup_time)
          }
        })
      }
    })
    
    // Convert map to array and use the most common time or first time for each location
    const locations = Array.from(locationsMap.values()).map(loc => {
      // If multiple times exist, use the first one (or could use most common)
      const timeArray = Array.from(loc.times)
      return {
        name: loc.name,
        time: timeArray.length > 0 ? timeArray[0] : loc.time,
        address: loc.address
      }
    })
    
    return locations.length > 0 ? locations : (Array.isArray(product?.meetingPoints) ? product.meetingPoints : [])
  }, [selectedVehiclePickupConfigs, product?.meetingPoints, product?.pickup_dropoff?.pickup_locations, selectedVehiclePickupTime])

  // Get selected meeting point
  const selectedMeetingPoint = useMemo(() => {
    if (selectedMeetingPointIndex === null || !Array.isArray(selectedVehicleMeetingPoints)) return null
    return selectedVehicleMeetingPoints[selectedMeetingPointIndex] || null
  }, [selectedMeetingPointIndex, selectedVehicleMeetingPoints])

  // Get tour time range for current vehicle - updates when vehicle selection changes
  const tourTimeRange = useMemo(() => {
    const pickupTime = selectedVehiclePickupTime
    // Priority: selected vehicle duration > product duration > first vehicle duration
    const duration = selectedVehicle?.duration || 
                     product?.duration || 
                     (Array.isArray(product?.vehicles) && product.vehicles.length > 0 ? product.vehicles[0]?.duration : null) ||
                     null
    
    const timeRange = calculateTourTimeRange(pickupTime, duration)
    
    // Debug logging for troubleshooting - log vehicle details
    if (pickupTime) {
      console.log('📅 Tour time calculation:', {
        pickupTime,
        duration,
        selectedVehicleIndex,
        vehicleTitle: selectedVehicle?.title || selectedVehicle?.model || 'N/A',
        selectedVehicleDuration: selectedVehicle?.duration || 'N/A',
        selectedVehicleId: selectedVehicle?.id || selectedVehicle?._id || 'N/A',
        pickupConfigsCount: selectedVehiclePickupConfigs.length,
        allVehiclesDuration: Array.isArray(product?.vehicles) ? product.vehicles.map(v => ({ 
          title: v.title || v.model, 
          duration: v.duration || 'N/A',
          id: v.id || v._id || 'N/A'
        })) : [],
        productDuration: product?.duration || 'N/A',
        calculatedTimeRange: timeRange
      })
    }
    
    return timeRange
  }, [
    selectedVehiclePickupTime,
    selectedVehicle?.duration,
    selectedVehicleIndex,
    selectedVehicle?.title,
    selectedVehicle?.model,
    selectedVehicle?.id,
    selectedVehicle?._id,
    selectedVehiclePickupConfigs,
    product?.duration,
    product?.vehicles,
    calculateTourTimeRange
  ])

  const getCurrencySymbol = useCallback((currency) => {
    if (!currency) return ''
    const code = currency.toUpperCase()
    switch (code) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'JPY': return '¥'
      case 'GBP': return '£'
      default: return code + ' '
    }
  }, [])

  const formatAmount = useCallback((value) => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '')
    }
    return value
  }, [])

  const pricingDetails = useMemo(() => {
    if (selectedVehicle?.amount) {
      const currency = selectedVehicle.currency || product?.currency || 'USD'
      return {
        displayAmount: `${getCurrencySymbol(currency)}${formatAmount(selectedVehicle.amount)}`,
        unit: selectedVehicle.pricing_type || product?.priceUnit || ''
      }
    }

    const currency = product?.currency || 'USD'
    const baseAmount = product?.priceValue ?? product?.price ?? 0
    return {
      displayAmount: `${getCurrencySymbol(currency)}${formatAmount(baseAmount)}`,
      unit: product?.priceUnit || ''
    }
  }, [selectedVehicle, product, getCurrencySymbol, formatAmount])

  const fetchProduct = useCallback(async () => {
    let cancelled = false
    try {
      setLoading(true)
      
      if (!identifier) {
        if (!cancelled) setProduct(null)
        return
      }
      
      // IMPORTANT: Always fetch full product details by ID for detail page
      // The /published endpoint uses LIST_PROJECTION which excludes detail fields
      // We need to use /products/{id} endpoint to get all fields
      let found = null;
      
      // First, try to fetch by ID directly (this gets ALL fields)
      // Check if identifier looks like an ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(identifier));
      
      const fetchById = async (targetId) => {
        if (!targetId) return null
        // Always prefer fresh data so new fields (like cancellation policy) appear immediately
        const fresh = await getProductById(String(targetId), false)
        if (fresh) return fresh
        return await getProductById(String(targetId), true)
      }

      if (isObjectId) {
        const byId = await fetchById(identifier)
        if (byId) {
          found = transformProductForFrontend(byId)
        }
      } else {
        const data = await getPublishedProducts({ page: 1, page_size: 50 }, true); // Use cache
        const list = (data.products || []).map(transformProductForFrontend);
        const normalize = (name) => String(name || '').toLowerCase().replace(/\s+/g,'-');
        
        // Find by slug
        const listProduct = list.find(p => normalize(p.name) === String(identifier).toLowerCase());
        
        if (listProduct && listProduct.id) {
          const byId = await fetchById(listProduct.id)
          if (byId) {
            found = transformProductForFrontend(byId);
          } else {
            // Fallback to list product if API fails
            found = listProduct;
          }
        } else {
          const byId = await fetchById(identifier)
          if (byId) found = transformProductForFrontend(byId);
        }
      }
      
      if (!cancelled) {
        setProduct(found || null)
        if (found) addRecentlyViewed(found)
        hasLoadedOnceRef.current = true
      }
      
      // Recommended from explore (most clicked) - use list for recommendations
      const data = await getPublishedProducts({ page: 1, page_size: 50 })
      const list = (data.products || []).map(transformProductForFrontend)
      const clicks = getProductClicks()
      const sorted = list
        .map(p => ({ ...p, clicks: clicks[p.id] || 0 }))
        .filter(p => !found || p.id !== found.id)
        .sort((a,b) => b.clicks - a.clicks)
        .slice(0,4)
      if (!cancelled) setRecommended(sorted)
    } catch (error) {
      // Don't log abort errors - they're expected when components unmount
      const isAbortError = error?.name === 'AbortError' || 
                          error?.message?.includes('aborted') ||
                          error?.message?.includes('signal is aborted');
      
      if (!cancelled && !isAbortError) {
        console.error('Error fetching product:', error)
        if (!initialFromCache) {
          setProduct(null)
        }
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }, [identifier, initialFromCache])

  useEffect(() => {
    setProduct(initialFromCache)
    setLoading(!initialFromCache)
    hasLoadedOnceRef.current = !!initialFromCache
  }, [initialFromCache])

  useEffect(() => {
    // If we have cached data, fetch fresh in background
    if (initialFromCache) {
      hasLoadedOnceRef.current = true
      setLoading(false)
      fetchProduct() // Fetch fresh data in background
    } else {
      // No cache, fetch immediately
      fetchProduct()
    }
  }, [identifier, fetchProduct]) // Include fetchProduct in dependencies

  
  // Ratings data for the Customer Reviews block (deterministic per product)
  const reviewBundles = useMemo(() => ([
    {
      averageRating: 4.9,
      totalReviews: 412,
      ratingBreakdown: [
        { stars: 5, count: 310 },
        { stars: 4, count: 82 },
        { stars: 3, count: 16 },
        { stars: 2, count: 4 },
        { stars: 1, count: 0 }
      ],
      reviews: [
        {
          name: 'Ava Carter',
          initials: 'AC',
          date: 'September 2025',
          rating: 5,
          text: 'The sunrise trek was unforgettable. Our guide Kenta knew every hidden corner and adjusted the pace for our group. A perfect mix of challenge and serenity.'
        },
        {
          name: 'Miguel Alvarez',
          initials: 'MA',
          date: 'August 2025',
          rating: 4,
          text: 'Loved the foodie tour! Every stop was delicious and authentic. Only wish we had a bit more time at the local market.'
        },
        {
          name: 'Priya Mehta',
          initials: 'PM',
          date: 'July 2025',
          rating: 5,
          text: 'Traveling with parents can be tricky but the crew handled every detail. Comfortable transport, thoughtful stories and the views were unreal.'
        },
        {
          name: 'Leo Martin',
          initials: 'LM',
          date: 'June 2025',
          rating: 5,
          text: 'As a solo traveler, I appreciated how inclusive the group felt. Met great people and learned so much about local culture.'
        },
        {
          name: 'Sakura Watanabe',
          initials: 'SW',
          date: 'May 2025',
          rating: 4,
          text: 'Cherry blossom picnic was dreamy. Weather shifted a bit but the team had blankets and hot tea ready. Would do it again.'
        }
      ]
    },
    {
      averageRating: 4.7,
      totalReviews: 278,
      ratingBreakdown: [
        { stars: 5, count: 190 },
        { stars: 4, count: 62 },
        { stars: 3, count: 20 },
        { stars: 2, count: 5 },
        { stars: 1, count: 1 }
      ],
      reviews: [
        {
          name: 'Hannah Brooks',
          initials: 'HB',
          date: 'October 2025',
          rating: 5,
          text: 'Best cycling route I have ever taken. Scenic stops, support van nearby and the coffee break was a treat.'
        },
        {
          name: 'Jonas Richter',
          initials: 'JR',
          date: 'September 2025',
          rating: 4,
          text: 'Kayaking session was smooth and beginner friendly. Slight delay at check-in but staff kept us informed.'
        },
        {
          name: 'Valentina Rossi',
          initials: 'VR',
          date: 'August 2025',
          rating: 5,
          text: 'Loved the storytelling element. Hearing legends while sailing past the cliffs gave the trip a magical feel.'
        },
        {
          name: 'Omar Hassan',
          initials: 'OH',
          date: 'July 2025',
          rating: 4,
          text: 'Family friendly and well organized. Kids loved the interactive workshop at the end.'
        },
        {
          name: 'Nora Lee',
          initials: 'NL',
          date: 'June 2025',
          rating: 5,
          text: 'Luxury but still down-to-earth. Chef-prepared lunch on the deck was sublime.'
        }
      ]
    },
    {
      averageRating: 4.8,
      totalReviews: 333,
      ratingBreakdown: [
        { stars: 5, count: 260 },
        { stars: 4, count: 54 },
        { stars: 3, count: 14 },
        { stars: 2, count: 4 },
        { stars: 1, count: 1 }
      ],
      reviews: [
        {
          name: 'Isabella Chen',
          initials: 'IC',
          date: 'September 2025',
          rating: 5,
          text: 'Photography coach on board was a genius. Learned how to shoot night skies and came home with stunning shots.'
        },
        {
          name: 'Marcus Green',
          initials: 'MG',
          date: 'August 2025',
          rating: 5,
          text: 'Zip-line and cave tour was beyond expectations. Safety briefing was thorough and the guides were hilarious.'
        },
        {
          name: 'Sofia Dimitri',
          initials: 'SD',
          date: 'July 2025',
          rating: 4,
          text: 'Great wine tasting, though the cellar portion felt a little rushed. Still highly recommend.'
        },
        {
          name: 'Benicio Torres',
          initials: 'BT',
          date: 'June 2025',
          rating: 5,
          text: 'Even my picky teen loved the VR history segment. Smart blend of tech and tradition.'
        },
        {
          name: 'Lena Krauss',
          initials: 'LK',
          date: 'May 2025',
          rating: 5,
          text: 'Sunset yacht cruise delivered drama in the sky and impeccable service. Blanket, music, everything on point.'
        }
      ]
    },
    {
      averageRating: 4.6,
      totalReviews: 298,
      ratingBreakdown: [
        { stars: 5, count: 180 },
        { stars: 4, count: 78 },
        { stars: 3, count: 28 },
        { stars: 2, count: 9 },
        { stars: 1, count: 3 }
      ],
      reviews: [
        {
          name: 'Emily Rhodes',
          initials: 'ER',
          date: 'October 2025',
          rating: 4,
          text: 'Hot air balloon had a slight wait due to weather but the crew kept spirits high. Floating above the valley was surreal.'
        },
        {
          name: 'Kazuo Mori',
          initials: 'KM',
          date: 'September 2025',
          rating: 5,
          text: 'Cultural immersion day was heartfelt. Cooking with the host family felt like visiting old friends.'
        },
        {
          name: 'Theresa Holt',
          initials: 'TH',
          date: 'August 2025',
          rating: 4,
          text: 'Whale watching delivered multiple sightings! Bring layers—the sea breeze is strong.'
        },
        {
          name: 'Diego Campos',
          initials: 'DC',
          date: 'July 2025',
          rating: 5,
          text: 'Mountain biking trails were well maintained. Loved the picnic with local cheeses afterward.'
        },
        {
          name: 'Mila Novak',
          initials: 'MN',
          date: 'June 2025',
          rating: 4,
          text: 'Temple lantern walk was peaceful and informative. Could use clearer signage at meeting point.'
        }
      ]
    }
  ]), [])

  const experienceSnapshot = useMemo(() => {
    if (!product) return []
    const computedGroupSize = product.groupSize || product.maxGroupSize || product.capacity
    const entries = [
      product.duration && { label: 'Duration', value: product.duration, icon: Clock },
      product.location && { label: 'Location', value: product.location, icon: MapPin },
      computedGroupSize && {
        label: 'Group size',
        value: typeof computedGroupSize === 'number' ? `Up to ${computedGroupSize} guests` : computedGroupSize,
        icon: UsersRound
      },
      product.languages && product.languages.length > 0 && {
        label: 'Languages',
        value: product.languages.join(', '),
        icon: MessageSquareText
      },
      product.activity_type && { label: 'Activity type', value: product.activity_type, icon: Droplet }
    ]
    return entries.filter(Boolean)
  }, [product])

  const reviewBundle = useMemo(() => {
    if (!product) return reviewBundles[0]
    const key = String(product.id || product.name || '').trim()
    if (!key) return reviewBundles[0]
    const hash = Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return reviewBundles[hash % reviewBundles.length]
  }, [product?.id, product?.name, reviewBundles])

  const averageRating = reviewBundle.averageRating
  const totalReviews = reviewBundle.totalReviews
  const ratingData = reviewBundle.ratingBreakdown.map((item) => {
    const percentage = totalReviews ? Math.round((item.count / totalReviews) * 100) : 0
    return { ...item, percentage: Math.min(100, percentage) }
  })
  const reviewList = reviewBundle.reviews
  const FALLBACK_SUPPLIER_NAME = 'TripsAdora Partner'
  const rawSupplierName =
    product?.supplierBusinessName ||
    product?.supplier_business_name ||
    product?.businessName ||
    product?.business_name ||
    product?.host ||
    ''
  const hasExplicitSupplierField = Boolean(product?.supplierBusinessName || product?.supplier_business_name)
  const isFallbackSupplierName =
    !hasExplicitSupplierField &&
    rawSupplierName.trim().toLowerCase() === FALLBACK_SUPPLIER_NAME.toLowerCase()
  const supplierName = isFallbackSupplierName ? '' : rawSupplierName
  const supplierNameForMeta = supplierName || rawSupplierName || FALLBACK_SUPPLIER_NAME
  const isSupplierHydrating = loading && (!supplierName || isFallbackSupplierName)
  const cancellationPolicy = product?.cancellationPolicy || product?.cancellation_policy
  const scheduleEntries = Array.isArray(cancellationPolicy?.schedule) ? cancellationPolicy.schedule : []
  const noteEntries = Array.isArray(cancellationPolicy?.notes) ? cancellationPolicy.notes : []
  const rawFreeCancellationText = (cancellationPolicy?.freeCancellationText || cancellationPolicy?.free_cancellation_text || '').trim()
  const freeCancellationText = rawFreeCancellationText || 'Free cancellation up to 24 hours'
  const hasCancellationPolicy = Boolean(
    cancellationPolicy && (scheduleEntries.length > 0 || noteEntries.length > 0 || rawFreeCancellationText)
  )
  const hasFaqs = Array.isArray(product?.faqs) && product.faqs.length > 0

  if (loading && !product && !hasLoadedOnceRef.current) {
    return (
      <div className="min-h-screen bg-white font-poppins">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-600">Loading...</div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-poppins">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-600">Product not found</div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />
      {isPolicyModalOpen && hasCancellationPolicy && (
        <CancellationPolicyModal
          policy={cancellationPolicy}
          onClose={() => setIsPolicyModalOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Product Header */}
            <div className="mb-6">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">Product ID: {product.id}</p>
              
              {/* Main Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-3">{product.name}</h1>
              
              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Hiking
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Adventure
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Nature
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Food
                </span>
                <span className="bg-[#284078] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  Photography
                </span>
              </div>
              
              {/* Description */}
              <p className="text-black text-sm sm:text-base lg:text-lg mb-3">{product.tagline || product.description}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-black text-sm sm:text-base">4.8 (342 reviews)</span>
              </div>
            </div>
            
            {/* Image Gallery - Improved layout with better spacing */}
            {images.length > 0 && (
              <div className="mb-6 sm:mb-8">
                {!showAllImages ? (
                  // Compact view: Main image + 3 thumbnails with minimal gap and bottom alignment
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-1.5 overflow-hidden rounded-lg">
                    <div className="sm:col-span-3 h-48 sm:h-64 lg:h-80 xl:h-96">
                      {images[0] && !imageErrors.has(images[0]) && (
                        <img 
                          src={images[0]} 
                          alt={product.name || "Product image"}
                          className="w-full h-full object-cover cursor-pointer rounded-lg hover:opacity-95 transition-opacity"
                          onClick={() => openGalleryAt(0)}
                          onError={(e) => {
                            setImageErrors(prev => new Set([...prev, images[0]]))
                            e.target.style.display = 'none'
                          }}
                          onLoad={() => setImagesLoaded(prev => new Set([...prev, images[0]]))}
                          loading="eager"
                        />
                      )}
                    </div>
                    <div className="sm:col-span-1 h-48 sm:h-64 lg:h-80 xl:h-96 flex flex-col justify-end gap-1 sm:gap-1.5">
                      {images.slice(1, 4).map((img, idx) => {
                        // Calculate thumbnail height to fill space evenly
                        const thumbnailCount = images.length > 4 ? 3 : images.slice(1, 4).length
                        const gapCount = thumbnailCount - 1
                        const totalGaps = gapCount * 4 // gap-1 = 4px, gap-1.5 = 6px (using 4px for calculation)
                        // For responsive, we'll use flex-1 to distribute space
                        return (
                          img && !imageErrors.has(img) && (
                            <img 
                              key={idx + 1}
                              src={img}
                              alt={`${product.name || "Product"} thumbnail ${idx + 1}`}
                              className="w-full flex-1 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity min-h-0"
                              onClick={() => openGalleryAt(idx + 1)}
                              onError={(e) => {
                                setImageErrors(prev => new Set([...prev, img]))
                                e.target.style.display = 'none'
                              }}
                              onLoad={() => setImagesLoaded(prev => new Set([...prev, img]))}
                              loading="lazy"
                            />
                          )
                        )
                      })}
                      {images.length > 4 && (
                        <button
                          onClick={() => setShowAllImages(true)}
                          className="w-full flex-1 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-lg flex items-center justify-center text-sm sm:text-base font-semibold transition-colors min-h-0"
                        >
                          +{images.length - 4} More
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Expanded view: Grid of all images
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-bold text-black">All Photos ({images.length})</h3>
                      <button
                        onClick={() => setShowAllImages(false)}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                      >
                        Show Less
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {images.map((img, idx) => (
                        img && !imageErrors.has(img) && (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img 
                              src={img}
                              alt={`${product.name || "Product"} image ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                              onClick={() => openGalleryAt(idx)}
                              onError={(e) => {
                                setImageErrors(prev => new Set([...prev, img]))
                                e.target.style.display = 'none'
                              }}
                              onLoad={() => setImagesLoaded(prev => new Set([...prev, img]))}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gallery Modal - Only show if images exist */}
            {isGalleryOpen && images.length > 0 && images[currentIndex] && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4" onClick={closeGallery}>
                <div className="relative w-full max-w-6xl" onClick={(e)=>e.stopPropagation()}>
                  {/* Close button */}
                  <button
                    onClick={closeGallery}
                    className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg"
                    aria-label="Close gallery"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <img 
                      src={images[currentIndex]} 
                      alt={`${product.name || "Product"} gallery image ${currentIndex + 1}`} 
                      className="w-full max-h-[80vh] object-contain mx-auto" 
                    />
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
                        {images.map((src, idx)=> (
                          <img
                            key={idx}
                            src={src}
                            alt={`thumb-${idx}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentIndex(idx)
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                            className={`h-14 w-20 object-cover rounded-md cursor-pointer border-2 transition-all ${
                              currentIndex === idx 
                                ? 'border-[#284078] ring-2 ring-[#E1E3FF] scale-110' 
                                : 'border-white/50 hover:border-white'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* About this Experience */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">About this Experience</h2>
              <p className="text-black leading-relaxed text-sm sm:text-base">{product.description || 'Experience an unforgettable tour.'}</p>
            </div>

            {experienceSnapshot.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-[#F8FBFF] to-[#F0F4FE] border border-[#E0E7FF] rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#284078] font-semibold">
                        Experience snapshot
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm">Key facts curated for quick planning</p>
                    </div>
                    <span className="text-xs font-semibold text-[#284078] bg-white px-3 py-1 rounded-full border border-[#D6E2FF]">
                      {experienceSnapshot.length} insights
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {experienceSnapshot.map(({ label, value, icon: Icon }, idx) => (
                      <div
                        key={`${label}-${idx}`}
                        className="flex items-start gap-3 bg-white/80 rounded-xl border border-white/60 px-3 py-3 sm:px-4 sm:py-4 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#2840780d] flex items-center justify-center text-[#284078]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Climate content is shown in a modal, not inline */}

            {/* Trip Highlights */}
            {Array.isArray(product.highlights) && product.highlights.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="border border-[#302E2E] rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#302E2E]">Trip Highlights</h2>
                    <span className="text-xs font-semibold text-[#302E2E] bg-[#F7F4ED] border border-[#E6DED0] rounded-full px-3 py-1">
                      {product.highlights.length} key moments
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-3">
                    <ShieldCheck className="w-4 h-4 text-[#34A853]" />
                    <span>Curated directly by the host for authenticity</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {product.highlights.map((h, idx) => {
                      const text = typeof h === 'string' ? h : (h.text || '');
                      return text ? (
                        <li key={idx} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#302E2E] flex items-center justify-center mt-0.5">
                            <span className="text-[#302E2E] text-sm">✓</span>
                          </div>
                          <span className="text-[#302E2E] text-sm sm:text-base">{text}</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* What's Included and What's Excluded */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* What's Included */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">What's Included</h2>
                  {Array.isArray(product.includedItems) && product.includedItems.length > 0 && (
                    <span className="text-xs font-semibold text-[#0B5E3B] bg-[#E5F5EB] border border-[#B4E6CE] rounded-full px-3 py-1">
                      {product.includedItems.length} items
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#34A853]" />
                  <span>Everything that comes standard with this tour</span>
                </div>
                {Array.isArray(product.includedItems) && product.includedItems.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {product.includedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#77FF90AD] rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-2 h-2 sm:w-3 sm:h-3 text-[#77FF90AD]" />
                        </div>
                        <span className="text-black text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No items listed</p>
                )}
              </div>

              {/* What's Excluded */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">What's Excluded</h2>
                  {Array.isArray(product.excludedItems) && product.excludedItems.length > 0 && (
                    <span className="text-xs font-semibold text-[#8B1F14] bg-[#FFF1F0] border border-[#F5C2BF] rounded-full px-3 py-1">
                      {product.excludedItems.length} reminders
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#F97316]" />
                  <span>Plan ahead for costs that are not covered</span>
                </div>
                {Array.isArray(product.excludedItems) && product.excludedItems.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {product.excludedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border border-red-300 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-red-500 text-xs">✗</span>
                        </div>
                        <span className="text-black text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No items listed</p>
                )}
              </div>

              {/* Vehicles Available */}
              <div>
                <div className="flex flex-col gap-1 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">Vehicles available</h2>
                    {Array.isArray(product.vehicles) && product.vehicles.length > 1 && (
                      <span className="text-xs font-semibold text-[#1d236b] bg-[#eef2ff] border border-[#d7deff] rounded-full px-3 py-1">
                        {product.vehicles.length} options
                      </span>
                    )}
                  </div>
                  {selectedVehicleIndex !== null && product.vehicles?.[selectedVehicleIndex] && (
                    <p className="text-xs sm:text-sm text-[#1d236b] font-medium">
                      Selected: {product.vehicles[selectedVehicleIndex].title || product.vehicles[selectedVehicleIndex].model || 'Preferred vehicle'}
                    </p>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {(product.vehicles || []).length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {product.vehicles.map((v, idx) => {
                        const isSelected = selectedVehicleIndex === idx
                        // Always display prices in USD for customers
                        const currencySymbol = '$'
                        const amount = typeof v.amount === 'number'
                          ? v.amount % 1 === 0 ? v.amount.toString() : v.amount.toFixed(2).replace(/\.?0+$/, '')
                          : (v.amount || '—')

                        return (
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedVehicleIndex(idx)}
                            key={idx}
                            className={`w-full text-left rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d236b] ${
                              isSelected
                                ? 'border-[#1d236b] bg-gradient-to-r from-[#eef2ff] to-white shadow-lg'
                                : 'border-gray-200 bg-white hover:border-[#1d236b]/60 hover:shadow-md'
                            }`}
                          >
                            <div className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white text-[#1d236b] shadow-inner' : 'bg-gray-100 text-gray-500'}`}>
                                    <Car className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-black font-semibold text-sm sm:text-base">
                                      {v.title || v.model || v.type || 'Vehicle'} {v.year ? `(${v.year})` : ''}
                                    </p>
                                    {v.capacity && (
                                      <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
                                        <UsersRound className="w-3.5 h-3.5 text-[#1d236b]" />
                                        Up to {v.capacity} passengers
                                      </p>
                                    )}
                                    {v.type && v.type !== v.model && v.title !== v.model && (
                                      <p className="text-gray-500 text-xs sm:text-sm">Type: {v.type}</p>
                                    )}
                                  </div>
                                </div>
                                {v.amount && (
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-black font-bold text-base sm:text-lg">
                                      {currencySymbol + amount}
                                    </p>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-1 uppercase tracking-wide">
                                      {v.pricing_type || 'Per trip'}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {v.features && v.features.length > 0 && v.features.slice(0,3).map((feature, featureIdx) => (
                                  <span
                                    key={featureIdx}
                                    className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-1"
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {isSelected && (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1d236b] bg-[#dfe7ff] border border-[#c5d1ff] rounded-full px-2 py-1">
                                    <Check className="w-3 h-3" />
                                    Selected
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No vehicles listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Details Section - Guide Type, Things to Carry, Accessibility */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4">Trip Details</h2>
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                {/* Guide Type */}
                {product.guideType && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">Guide Type</h3>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base ml-6">{product.guideType}</p>
                  </div>
                )}

                {/* Things to Carry */}
                {product.thingsToCarry && product.thingsToCarry.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">Things to Carry</h3>
                    </div>
                    <ul className="space-y-1 ml-6">
                      {product.thingsToCarry.map((item, idx) => (
                        <li key={idx} className="text-gray-700 text-sm sm:text-base">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Accessibility */}
                {product.accessibility && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-gray-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-black">Accessibility</h3>
                    </div>
                    <div className="ml-6 space-y-2">
                      {product.accessibility.wheelchair_accessible && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Wheelchair accessible
                        </p>
                      )}
                      {product.accessibility.service_animals_allowed && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Service animals allowed
                        </p>
                      )}
                      {product.accessibility.infant_seat_available && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Infant seat available
                        </p>
                      )}
                      {product.accessibility.stroller_friendly && (
                        <p className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          Stroller friendly
                        </p>
                      )}
                      {!product.accessibility.wheelchair_accessible && 
                       !product.accessibility.service_animals_allowed && 
                       !product.accessibility.infant_seat_available && 
                       !product.accessibility.stroller_friendly && (
                        <p className="text-gray-500 text-sm">No accessibility features listed</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-6">
              {/* Tour Provider */}
              <div className="mb-4 sm:mb-6 bg-[#F0F4FE] p-3 sm:p-4 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-3">
                  {isSupplierHydrating ? (
                    <div className="h-5 w-32 bg-white/70 rounded animate-pulse" aria-label="Loading supplier name" />
                  ) : supplierName ? (
                    <h3 className="text-base sm:text-lg font-bold text-black">{supplierName}</h3>
                  ) : (
                    <span className="text-sm text-gray-500">Supplier details updating</span>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowVerifiedTooltip(true)}
                      onMouseLeave={() => setShowVerifiedTooltip(false)}
                      onFocus={() => setShowVerifiedTooltip(true)}
                      onBlur={() => setShowVerifiedTooltip(false)}
                      className="bg-[#00A63E] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00A63E]"
                    >
                      <Check className="w-3 h-3" />
                      Verified
                    </button>
                    {showVerifiedTooltip && (
                      <div className="absolute right-0 top-full mt-2 bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-1 shadow-lg whitespace-nowrap">
                        This supplier is verified by admin
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-black font-bold text-sm sm:text-base">4.8</span>
                </div>
                
                <p className="text-gray-600 text-xs sm:text-sm mb-4">156 Tours completed</p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="bg-white border border-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  >
                    Chat
                  </button>
                  <button
                    className="bg-white border border-gray-300 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                    onClick={async () => {
                      if (!product) {
                        setIsClimateOpen(true)
                        return
                      }
                      console.info('[CLIMATE][UI] Climate button clicked for product', {
                        id: product.id,
                        name: product.name,
                        currentLocation: product.location,
                      })
                      try {
                        const resolved = await ensureProductLocationResolved({
                          productId: product.id,
                          name: product.name,
                          location: product.location,
                        })
                        console.info('[CLIMATE][UI] ensureProductLocationResolved result for product', product.id, ':', resolved)
                        if (resolved) {
                          setProduct(prev => (prev ? { ...prev, location: resolved } : prev))
                        }
                      } catch (e) {
                        // Non-fatal – climate widget will still fall back gracefully.
                        console.warn('[CLIMATE][UI] Failed to ensure product location before opening climate', e)
                      }
                      setIsClimateOpen(true)
                    }}
                  >
                    Climate
                  </button>
                </div>
              </div>

              {/* Icons pill container */}
              <div className="mb-6">
                <div className="bg-[#F0F4FE] border border-gray-200 rounded-full px-6 py-2 flex items-center justify-between shadow-md">
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900 hover:text-red-500">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-900">
                    <img src={share} alt="Share" className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={async () => {
                      if (product?.id) {
                        console.info('[COMPARE][UI] Compare button clicked for base product', {
                          id: product.id,
                          name: product.name,
                          currentLocation: product.location,
                        })
                        try {
                          // Ensure we have a saved location for this base product
                          const resolved = await ensureProductLocationResolved({
                            productId: product.id,
                            name: product.name,
                            location: product.location,
                          })
                          console.info('[COMPARE][UI] Base product resolved location:', resolved)
                        } catch (e) {
                          console.warn('[COMPARE][UI] Failed to ensure product location before comparison', e)
                        }
                        const params = new URLSearchParams()
                        params.set('compareFrom', product.id)
                        navigate(`/search?${params.toString()}`)
                      } else {
                        navigate('/search')
                      }
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <img src={branch} alt="Compare" className="w-5.h-5" />
                  </button>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-900">
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Tour Details */}
              <div className="mb-4 sm:mb-6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Languages - from product data */}
                  {product.languages && product.languages.length > 0 && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MessageSquareText className="w-4 h-4 text-gray-600" />
                      <span className="text-black text-sm sm:text-base">{product.languages.join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-black text-sm sm:text-base">{product.location}</span>
                  </div>
                  
                  {/* Duration */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-black text-sm sm:text-base">{product.duration}</span>
                  </div>
                  
                  {/* Activity Type - from product data */}
                  {product.activity_type && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Droplet className="w-4 h-4 text-gray-600" />
                      <span className="text-black text-sm sm:text-base">{product.activity_type}</span>
                    </div>
                  )}
                  
                  {/* Guide Type - from product data */}
                  {product.guideType && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <UserPlus className="w-4 h-4 text-gray-600" />
                      <span className="text-black text-sm sm:text-base">Guide: {product.guideType}</span>
                    </div>
                  )}
                  
                  <div className="w-full">
                    <button
                      type="button"
                      disabled={!hasCancellationPolicy}
                      onClick={() => hasCancellationPolicy && setIsPolicyModalOpen(true)}
                      className={`flex items-center gap-2 sm:gap-3 text-left rounded-full px-2 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#34A853] ${
                        hasCancellationPolicy
                          ? 'hover:bg-[#e5f5eb]'
                          : 'opacity-60 cursor-not-allowed bg-transparent'
                      }`}
                    >
                      <UserPlus className="w-4 h-4 text-gray-600" />
                      <span className="text-[#34A853] text-sm sm:text-base font-bold">
                        Cancellation Policy
                      </span>
                    </button>
                  </div>
                  
                  <div className="pt-2">
                    <a href="#" className="text-gray-500 underline text-xs sm:text-sm">
                      See all the visiting places in Tokyo
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Pricing */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline justify-start">
                  <span className="text-black font-bold text-sm sm:text-base">Total</span>
                  <div className="flex items-baseline gap-2 ml-2">
                    <span className="text-xl sm:text-2xl font-bold text-[#00A63E]">
                      {pricingDetails.displayAmount}
                    </span>
                    {pricingDetails.unit && (
                      <span className="text-gray-600 text-xs sm:text-sm">{pricingDetails.unit}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <button 
                  onClick={() => navigate('/check-availability', { 
                    state: { 
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      location: product.location,
                      rating: product.rating,
                      duration: product.duration,
                      // Pass pickup_dropoff data for available days and time slots
                      pickup_dropoff: product.pickup_dropoff || null,
                      availableDays: product.pickup_dropoff?.available_days || [],
                      timeSlotsByDay: product.pickup_dropoff?.time_slots_by_day || {},
                      // Pass selected vehicle and meeting point information
                      selectedVehicleIndex: selectedVehicleIndex,
                      selectedVehicle: selectedVehicle,
                      selectedMeetingPointIndex: selectedMeetingPointIndex,
                      selectedMeetingPoint: selectedMeetingPoint,
                      selectedVehicleMeetingPoints: selectedVehicleMeetingPoints,
                      // Pass full product for reference
                      product: product,
                      // Remember where we came from so back button works correctly
                      from: 'product-details'
                    } 
                  })}
                  className="bg-[#34A853] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base whitespace-nowrap shadow-md hover:bg-[#2d8f47] transition"
                >
                  Check Availability
                </button>
                <button 
                  onClick={() => {
                    // Get or initialize cart from localStorage
                    const savedCart = localStorage.getItem('cart')
                    const cart = savedCart ? JSON.parse(savedCart) : []
                    
                    // Create cart item object
                    const cartItem = {
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      price: product.price,
                      rating: product.rating,
                      reviews: String(product.reviewsCount || '0'),
                      tags: product.tags || [],
                      host: supplierNameForMeta,
                      duration: product.duration,
                      groupSize: product.groupSize || 'Up to 12',
                      location: product.location
                    }
                    
                    // Check if item is already in cart
                    const isInCart = cart.some(item => item.id === cartItem.id)
                    
                    if (!isInCart) {
                      // Add to cart
                      const updatedCart = [...cart, cartItem]
                      localStorage.setItem('cart', JSON.stringify(updatedCart))
                    }
                    
                    // Navigate to cart page
                    navigate('/cart')
                  }}
                  className="bg-white border border-gray-300 text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base whitespace-nowrap shadow hover:bg-gray-50 transition"
                >
                  Add to Cart
                </button>
              </div>
              
              {/* Quick Detail */}
              <div
                ref={quickDetailRef}
                tabIndex={-1}
                className="border border-gray-200 rounded-xl p-4 sm:p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#34A853]"
              >
                <h4 className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3">
                  Quick Detail
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 border border-[#34A853] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 text-[#34A853]" />
                    </div>
                    <span className="text-black text-xs sm:text-sm font-bold">
                      {freeCancellationText || 'Free cancellation up to 24 hours'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 border border-[#34A853] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 text-[#34A853]" />
                    </div>
                    <span className="text-black text-xs sm:text-sm">
                      Instant confirmation
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-4 h-4 border border-[#34A853] rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-2 h-2 text-[#34A853]" />
                    </div>
                    <span className="text-black text-xs sm:text-sm">
                      Mobile ticket accepted
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Modal */}
        {isClimateOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4" onClick={() => setIsClimateOpen(false)}>
            <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              {/* Borderless container with floating close button */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <button
                  aria-label="Close"
                  className="absolute right-3 top-3 z-10 bg-white/90 hover:bg-white text-gray-900 px-3 py-1 rounded-full text-sm"
                  onClick={() => setIsClimateOpen(false)}
                >
                  Close
                </button>
                <ClimateWidget productName={product.name} productLocation={product.location} />
              </div>
            </div>
          </div>
        )}

        {/* Meeting Points - Full width - Matching supplier design */}
        {selectedVehicleMeetingPoints.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2">Meeting Points</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-4">Choose your convenient pickup location</p>
            <div className="rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {selectedVehicleMeetingPoints.map((loc, idx) => {
                  const locationName = typeof loc === 'string' ? loc : (loc.name || loc || 'Pickup Location');
                  const address = typeof loc === 'object' ? (loc.address || '') : '';
                  // Use time from the location object (from configuration) first, then fallback to selectedVehiclePickupTime
                  const time = (typeof loc === 'object' && loc.time) 
                    ? loc.time 
                    : (selectedVehiclePickupTime || product.pickupTime || '08:00');
                  const isSelected = selectedMeetingPointIndex === idx;
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedMeetingPointIndex(idx)}
                      className={`bg-white border-2 rounded-lg p-4 shadow-sm transition-all duration-200 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E1DC4] ${
                        isSelected
                          ? 'border-[#0E1DC4] bg-gradient-to-r from-[#E5EDFF] to-white shadow-md'
                          : 'border-gray-200 hover:border-[#0E1DC4]/60 hover:shadow-md'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MapPin className={`w-5 h-5 mt-1 flex-shrink-0 ${isSelected ? 'text-[#0E1DC4]' : 'text-[#0E1DC4]'}`} />
                          <div className="flex-1">
                            <h3 className="font-bold text-black text-sm sm:text-base mb-1">{locationName}</h3>
                            {address && address !== locationName && (
                              <p className="text-gray-500 text-xs sm:text-sm">{address}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`flex items-center gap-1 rounded-full px-2 py-1 ${isSelected ? 'bg-[#0E1DC4]/10' : 'bg-gray-100'}`}>
                            <Clock className={`w-4 h-4 ${isSelected ? 'text-[#0E1DC4]' : 'text-gray-600'}`} />
                            <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-[#0E1DC4]' : 'text-gray-700'}`}>{time}</span>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#0E1DC4] flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hotel Pickup Banner */}
        <div className="bg-[#E5EDFF75] rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="font-bold text-black text-sm sm:text-base mb-2">Hotel Pickup Available:</h3>
          <p className="text-black text-sm sm:text-base">
            We offer complimentary pickup from most hotels in Fira, Oia, and Kamari areas. 
            Please confirm your location when booking.
          </p>
        </div>

        {/* Tour Itinerary - Matching supplier design */}
        {Array.isArray(product.itineraries) && product.itineraries.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Tour Itinerary</h2>
            <p className="text-gray-500 mb-6">Your personalized travel plan at a glance</p>
            
            {/* Tour Type Bar */}
            <div className="mb-8">
              <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 relative">
                  <Clock className="w-5 h-5 text-white" />
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-600"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-black">One day Tour</h3>
                  <p className="text-sm text-gray-600">
                    {tourTimeRange ? `(${tourTimeRange})` : (selectedVehiclePickupTime ? `(${selectedVehiclePickupTime} - --:--)` : '(Select vehicle to see time)')}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-300"></div>

              {/* Pick-up Location */}
              {selectedVehicleMeetingPoints.length > 0 && (
                <div className="flex items-start mb-8 relative">
                  <div className="w-8 h-8 border-2 border-green-700 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                    <MapPin className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Pick-up</h3>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {selectedVehicleMeetingPoints.slice(0, 3).map((loc, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {typeof loc === 'string' ? loc : (loc.name || loc)}
                        </span>
                      ))}
                    </div>
                    {selectedVehiclePickupTime && (
                      <p className="text-sm text-gray-600">Time: {selectedVehiclePickupTime}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Itinerary Stops */}
              {product.itineraries.map((item, index) => {
                const location = item.location || item.title || item.name || `Stop ${index + 1}`;
                const description = item.description || '';
                const timeSpent = item.timeSpent || '';
                const isFree = item.isFree !== false;
                const ticketFare = item.ticketFare || item.ticket || '';
                const photo = item.photo || null;
                const attractionType = item.attractionType || '';
                const activities = item.activities || [];
                
                return (
                  <div key={index} className="flex items-start mb-8 relative">
                    <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10 overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={location} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-sm font-semibold text-gray-800">
                          {location[0]?.toUpperCase() || String(index + 1)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">{location}</h3>
                      {description && (
                        <p className="text-gray-600 mb-3">{description}</p>
                      )}
                      
                      {/* Activities */}
                      {(() => {
                        const badges = [];
                        const seen = new Set();
                        if (attractionType && !seen.has(attractionType)) {
                          badges.push(attractionType);
                          seen.add(attractionType);
                        }
                        (activities || []).forEach(act => {
                          if (act && !seen.has(act)) {
                            badges.push(act);
                            seen.add(act);
                          }
                        });
                        if (!badges.length) return null;
                        return (
                          <div className="mb-3">
                            <p className="text-gray-600 font-bold mb-2">Activities:</p>
                            <div className="flex flex-wrap gap-2">
                              {badges.map((badge, idx) => (
                                <span key={idx} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Time and Ticket Info */}
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                          Ticket: {isFree ? 'Free' : (ticketFare ? ticketFare : 'Paid')}
                        </span>
                        {timeSpent && (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                            {timeSpent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Drop-off Location */}
              {selectedVehicleDropoffLocations.length > 0 && (
                <div className="flex items-start mb-8 relative">
                  <div className="w-8 h-8 border-2 border-red-700 bg-red-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                    <MapPin className="w-4 h-4 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Drop-off</h3>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {selectedVehicleDropoffLocations.slice(0, 3).map((loc, idx) => {
                        const locationName = typeof loc === 'string' ? loc : (loc.name || loc);
                        // Check if dropoff location is same as pickup location
                        const isSameAsPickup = selectedVehicleMeetingPoints.some(pickupLoc => {
                          const pickupName = typeof pickupLoc === 'string' ? pickupLoc : (pickupLoc.name || pickupLoc);
                          return pickupName.toLowerCase() === locationName.toLowerCase();
                        });
                        
                        return (
                          <span 
                            key={idx} 
                            className={`px-3 py-1 rounded-full text-sm ${
                              isSameAsPickup 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                            title={isSameAsPickup ? 'Same as pickup location' : 'Different dropoff location'}
                          >
                            {locationName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Finished - Return */}
              <div className="flex items-start mb-8 relative">
                <div className="w-8 h-8 border-2 border-blue-700 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                  <ArrowUpRight className="w-4 h-4 text-blue-700 rotate-180" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-black">Finished - Return</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {hasFaqs && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl border-2 border-gray-200/80 px-6 sm:px-8 py-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-[#3B69E2]" />
                <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {product.faqs.map((faq, index) => {
                  const question = faq?.question || `Question ${index + 1}`
                  const answer = faq?.answer || ''
                  const isExpanded = expandedFaqIndex === index
                  return (
                    <div key={`${question}-${index}`} className="py-4">
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between text-left gap-4"
                      >
                        <span className="text-sm sm:text-base font-semibold text-gray-900">
                          {question}
                        </span>
                        {isExpanded ? (
                          <Minus className="w-5 h-5 text-[#3B69E2]" />
                        ) : (
                          <Plus className="w-5 h-5 text-[#3B69E2]" />
                        )}
                      </button>
                      {isExpanded && answer && (
                        <p className="mt-3 text-sm sm:text-base text-gray-600">{answer}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="max-w-6xl mx-auto p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>

            {/* Reviews Overview Box */}
            <div className="flex gap-6 mb-6">
              {/* Left Side - Overall Rating with Background */}
              <div className="bg-[#F4F7FF] rounded-lg px-6 py-10 flex flex-col items-center justify-center w-15 h-28 mt-28">
                <div className="text-5xl font-bold text-[#3B69E2] mb-3">{averageRating}</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : star === Math.ceil(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-none text-gray-900 stroke-2'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{totalReviews} Reviews</p>
              </div>

              {/* Right Side - Rating Breakdown with White Background */}
              <div className="flex-1 bg-white rounded-lg p-6 space-y-3">
                {ratingData.map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-11">
                      <span className="text-sm font-medium text-gray-700">{rating.stars}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>

                    <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3B69E2] rounded-full transition-all"
                        style={{ width: `${rating.percentage}%` }}
                      ></div>
                    </div>

                    <span className="text-sm font-medium text-gray-700 w-8 text-right">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6 mt-8">
              {reviewList.map((review, idx) => (
                <div key={`${review.name}-${idx}`} className="flex gap-4 bg-white shadow-md rounded-lg p-4">
                  <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#3B69E2]">
                      {review.initials || review.name?.[0] || 'G'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{review.name}</h4>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill={s <= review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Tours */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-black">Recommended Tours</h2>
            <p className="text-gray-500 text-sm mt-1">Discover more amazing experiences around the world</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommended.map((t) => (
              <TourCard key={t.id} tour={t} onClick={() => { recordProductClick(t.id); navigate(`/tours/${encodeURIComponent(t.name?.toLowerCase().replace(/\s+/g,'-'))}`) }} />
            ))}
          </div>
        </div>

        {/* Divider above footer */}
        <div className="mt-12 border-t border-gray-200"></div>
      </div>

      <Footer />

      {/* Supplier Chat Modal */}
      <SupplierChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        supplierName={supplierName || supplierNameForMeta}
        supplierId={product?.supplierId || product?.supplier_id}
        supplierRating={product?.rating || 4.8}
        supplierReviews={product?.reviewsCount || 342}
        supplierFollowers={2840}
        supplierVerified={true}
        productId={product?.id}
        customerId={localStorage.getItem('customer_profile_user_id') || 'default-customer'}
      />
    </div>
  )
}

export default ProductDetails