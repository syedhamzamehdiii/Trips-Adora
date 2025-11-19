import { apiService } from './api';

const BASE_PATH = '/vehicles';

const mapVehicle = (vehicle) => ({
  id: vehicle.id,
  productId: vehicle.product_id,
  title: vehicle.title,
  type: vehicle.vehicle_type,
  model: vehicle.variant,
  year: vehicle.year,
  attributes: vehicle.attributes,
  capacity: vehicle.capacity,
  currency: vehicle.currency,
  pricingType: vehicle.pricing_type,
  amount: vehicle.amount,
  duration: vehicle.duration,
  description: vehicle.description,
  isActive: vehicle.is_active,
  createdAt: vehicle.created_at,
  updatedAt: vehicle.updated_at,
});

const normalizePayload = (vehicle) => ({
  product_id: vehicle.productId,
  title: vehicle.title,
  vehicle_type: vehicle.type,
  variant: vehicle.model,
  year: vehicle.year,
  attributes: vehicle.attributes,
  capacity: vehicle.capacity,
  currency: vehicle.currency,
  pricing_type: vehicle.pricingType,
  amount: Number(vehicle.amount),
  duration: vehicle.duration,
  description: vehicle.description,
  is_active: vehicle.isActive ?? true,
});

const wrapRequest = async (action) => {
  try {
    return await action();
  } catch (error) {
    const message =
      error?.response?.data?.detail ||
      error?.friendlyMessage ||
      error?.message ||
      'An unexpected error occurred.';
    const wrapped = new Error(message);
    wrapped.cause = error;
    throw wrapped;
  }
};

export const vehicleService = {
  async list(productId) {
    return wrapRequest(async () => {
      const params = productId ? { product_id: productId } : {};
      const response = await apiService.get(BASE_PATH, params);
      const raw = Array.isArray(response?.vehicles) ? response?.vehicles : [];
      return raw.map(mapVehicle);
    });
  },

  async create(vehicle) {
    return wrapRequest(async () => {
      const payload = normalizePayload(vehicle);
      const response = await apiService.post(BASE_PATH, payload);
      return mapVehicle(response);
    });
  },

  async update(id, vehicle) {
    return wrapRequest(async () => {
      const payload = normalizePayload(vehicle);
      const response = await apiService.put(`${BASE_PATH}/${id}`, payload);
      return mapVehicle(response);
    });
  },

  async remove(id) {
    return wrapRequest(async () => {
      await apiService.delete(`${BASE_PATH}/${id}`);
      return true;
    });
  },
};

export default vehicleService;
