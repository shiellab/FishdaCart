import { API_BASE_URL } from '../config/appConfig';
import { auth } from './firebaseConfig';

const API_URL = new URL(API_BASE_URL);
const API_ORIGIN = `${API_URL.protocol}//${API_URL.host}`;

const buildHeaders = async (headers = {}, authRequired = true) => {
  const nextHeaders = { ...headers };
  const currentUser = auth().currentUser;

  if (currentUser) {
    const token = await currentUser.getIdToken();
    nextHeaders.Authorization = `Bearer ${token}`;
  } else if (authRequired) {
    throw new Error('You must be signed in to complete this request.');
  }

  return nextHeaders;
};

const apiFetch = async (path, options = {}, authRequired = true) => {
  const { headers = {}, ...requestOptions } = options;
  return fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: await buildHeaders(headers, authRequired),
  });
};

const buildHttpError = async (response, fallbackMessage = 'API request failed') => {
  let details = '';

  try {
    const responseBody = await response.text();
    if (responseBody) {
      details = ` - ${responseBody.slice(0, 250)}`;
    }
  } catch (error) {
    details = '';
  }

  return new Error(`${fallbackMessage}: ${response.status} ${response.statusText}${details}`);
};

const logApiWarning = (message, error) => {
  console.warn(`${message}. API: ${API_BASE_URL}`, error?.message || error);
};

const normalizeImageUrl = (fish) => {
  const rawImage =
    fish.image_url ||
    fish.image ||
    fish.photo_url ||
    fish.photo ||
    fish.thumbnail_url ||
    null;

  if (!rawImage || typeof rawImage !== 'string') return null;
  const cleanedImage = rawImage.trim().replace(/\\/g, '/');

  if (cleanedImage.startsWith('http://') || cleanedImage.startsWith('https://')) {
    try {
      const parsedUrl = new URL(cleanedImage);
      const isLocalhostImage =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname === '::1';

      if (isLocalhostImage) {
        return `${API_ORIGIN}${parsedUrl.pathname}${parsedUrl.search}`;
      }
    } catch (error) {
      console.error('Invalid image URL from API:', cleanedImage, error);
    }

    return cleanedImage;
  }
  if (cleanedImage.startsWith('/')) return `${API_ORIGIN}${cleanedImage}`;
  if (cleanedImage.startsWith('storage/')) return `${API_ORIGIN}/${cleanedImage}`;
  if (cleanedImage.startsWith('fish_images/')) return `${API_ORIGIN}/storage/${cleanedImage}`;
  return `${API_ORIGIN}/${cleanedImage}`;
};

export const getFishListings = async (categoryId = null) => {
  try {
    const path = categoryId 
      ? `/fish?category_id=${categoryId}`
      : '/fish';
    console.log('Fetching fish from:', `${API_BASE_URL}${path}`);
    const response = await apiFetch(path, {}, false); // Try without auth first
    console.log('Fish API response status:', response.status);
    if (!response.ok) {
      console.error('Fish API error:', response.status, await response.text());
      throw await buildHttpError(response, 'API Sync Error');
    }
    const data = await response.json();
    console.log('Fish data received:', data.length, 'items');
    return data.map(fish => ({
      id: fish.id.toString(),
      ...fish,
      imageUrl: normalizeImageUrl(fish),
      price: Number(fish.price)
    }));
  } catch (error) {
    console.error('Error fetching fish:', error);
    logApiWarning('Error fetching MySQL listings', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await apiFetch('/categories');
    if (!response.ok) throw new Error('API Sync Error');
    return await response.json();
  } catch (error) {
    logApiWarning('Error fetching categories', error);
    return [];
  }
};

export const placeOrder = async (orderData) => {
  try {
    const response = await apiFetch('/orders', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firebase_uid: orderData.userId,
        address: orderData.address || 'Profile Address',
        phone: orderData.phone || '000-000-0000',
        total: orderData.total,
        items: orderData.items.map(item => ({ id: parseInt(item.id, 10), quantity: item.quantity, price: item.price }))
      })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Order request failed');
    }
    return { success: true, orderId: result.order_id || Date.now().toString() };
  } catch (error) {
    logApiWarning('Error placing order on Laravel', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const response = await apiFetch(`/orders/${userId}`);
    if (!response.ok) throw new Error('API Sync Error');
    const data = await response.json();
    return data.map(order => ({
      id: order.id.toString(),
      createdAt: order.created_at, // API returns created_at
      ...order
    }));
  } catch (error) {
    logApiWarning('Error fetching user orders from Laravel', error);
    return [];
  }
};

export const syncUserToBackend = async (userData) => {
  const normalizedRole = userData.role === 'Breeder' ? 'Vendor' : (userData.role || 'Customer');

  const payload = {
    firebase_uid: userData.uid,
    email: userData.email,
    name: userData.name || null,
    role: normalizedRole
  };

  const response = await apiFetch('/sync-user', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sync failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

export const getUserStats = async (userId) => {
  try {
    const response = await apiFetch(`/user-stats/${userId}`);
    if (!response.ok) throw new Error('API Sync Error');
    return await response.json();
  } catch (error) {
    logApiWarning('Error fetching user stats from Laravel', error);
    return null;
  }
};

export const getFishStats = async (fishId) => {
  try {
    const response = await apiFetch(`/fish-stats/${fishId}`);
    if (!response.ok) throw new Error('API Sync Error');
    return await response.json();
  } catch (error) {
    logApiWarning('Error fetching fish stats', error);
    return null;
  }
};

export const getTopSellingFish = async () => {
  try {
    const response = await apiFetch('/top-selling-fish');
    if (!response.ok) throw new Error('API Sync Error');
    return await response.json();
  } catch (error) {
    logApiWarning('Error fetching top selling fish', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiFetch(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  } catch (error) {
    logApiWarning('Error updating order status', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await apiFetch(`/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Cancel failed');
    }
    return await response.json();
  } catch (error) {
    logApiWarning('Error cancelling order', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await apiFetch('/all-orders');
    if (!response.ok) throw new Error('API Sync Error');
    return await response.json();
  } catch (error) {
    logApiWarning('Error fetching all orders', error);
    return [];
  }
};

// Fish CRUD (image is managed by admin backend only)
export const createFish = async (fishData, imageFile = null) => {
  try {
    const formData = new FormData();
    
    // Append all fish data
    Object.keys(fishData).forEach(key => {
      formData.append(key, fishData[key]);
    });

    const response = await apiFetch('/fish', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create fish failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    logApiWarning('Error creating fish', error);
    throw error;
  }
};

export const updateFish = async (fishId, fishData, imageFile = null) => {
  try {
    const formData = new FormData();
    
    // Append all fish data
    Object.keys(fishData).forEach(key => {
      formData.append(key, fishData[key]);
    });

    const response = await apiFetch(`/fish/${fishId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Update fish failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    logApiWarning('Error updating fish', error);
    throw error;
  }
};

export const deleteFish = async (fishId) => {
  try {
    const response = await apiFetch(`/fish/${fishId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Delete failed');
    return await response.json();
  } catch (error) {
    logApiWarning('Error deleting fish', error);
    throw error;
  }
};
