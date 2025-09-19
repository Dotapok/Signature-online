import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '@/types/next';
import { apiClient } from '@/lib/api';
import { useToast } from './useToast';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions<T> {
  url: string;
  method?: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  enabled?: boolean;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  onSettled?: (data: T | null, error: any) => void;
}

interface FetchResult<T> {
  data: T | null;
  error: any;
  loading: boolean;
  isFetching: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  refetch: () => Promise<void>;
  mutate: (data: any) => void;
}

// Cache for storing API responses
const cache = new Map<string, { data: any; timestamp: number }>();

// Function to generate a cache key
const generateCacheKey = (url: string, params?: Record<string, any>) => {
  const paramsString = params ? `?${new URLSearchParams(params).toString()}` : '';
  return `${url}${paramsString}`;
};

// Function to clean up old cache entries
const cleanupCache = (maxAge: number) => {
  const now = Date.now();
  for (const [key, { timestamp }] of cache.entries()) {
    if (now - timestamp > maxAge) {
      cache.delete(key);
    }
  }
};

export function useFetch<T = any>({
  url,
  method = 'GET',
  data,
  params,
  headers,
  enabled = true,
  cacheTime = 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus = true,
  onSuccess,
  onError,
  onSettled,
}: FetchOptions<T>): FetchResult<T> {
  const [state, setState] = useState<{
    data: T | null;
    error: any;
    loading: boolean;
    isFetching: boolean;
    status: 'idle' | 'loading' | 'success' | 'error';
  }>({
    data: null,
    error: null,
    loading: false,
    isFetching: false,
    status: 'idle',
  });
  
  const { error: showError } = useToast();
  const cacheKeyRef = useRef<string>('');
  
  // Generate cache key
  useEffect(() => {
    cacheKeyRef.current = generateCacheKey(url, params);
  }, [url, params]);
  
  // Fetch data function
  const fetchData = useCallback(async (isRefetch = false) => {
    // Skip if disabled
    if (!enabled && !isRefetch) return;
    
    // Skip if already loading and not a refetch
    if (state.loading && !isRefetch) return;
    
    // Check cache first for GET requests
    if (method === 'GET' && !isRefetch) {
      const cachedData = cache.get(cacheKeyRef.current);
      if (cachedData) {
        // Return cached data if not expired
        if (Date.now() - cachedData.timestamp < cacheTime) {
          setState(prev => ({
            ...prev,
            data: cachedData.data,
            status: 'success',
          }));
          onSuccess?.(cachedData.data);
          onSettled?.(cachedData.data, null);
          return;
        }
      }
    }
    
    // Set loading state
    setState(prev => ({
      ...prev,
      loading: !isRefetch,
      isFetching: true,
      status: 'loading',
    }));
    
    try {
      // Make the API request
      const response = await apiClient.request<ApiResponse<T>>({
        url,
        method,
        data,
        params,
        headers,
      });
      
      // Cache the response for GET requests
      if (method === 'GET' && response.data) {
        cache.set(cacheKeyRef.current, {
          data: response.data,
          timestamp: Date.now(),
        });
        
        // Clean up old cache entries
        cleanupCache(cacheTime);
      }
      
      // Update state with the response data
      setState({
        data: response.data || null,
        error: null,
        loading: false,
        isFetching: false,
        status: 'success',
      });
      
      // Call success callback
      if (response.data) {
        onSuccess?.(response.data);
      }
      
      // Call settled callback
      onSettled?.(response.data || null, null);
      
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching ${url}:`, error);
      
      // Update state with the error
      setState(prev => ({
        ...prev,
        error,
        loading: false,
        isFetching: false,
        status: 'error',
      }));
      
      // Show error toast
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      showError(errorMessage);
      
      // Call error callback
      onError?.(error);
      
      // Call settled callback
      onSettled?.(null, error);
      
      throw error;
    }
  }, [url, method, JSON.stringify(data), JSON.stringify(params), enabled, cacheTime, onSuccess, onError, onSettled]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;
    
    const handleFocus = () => {
      fetchData(true);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchOnWindowFocus, enabled, fetchData]);
  
  // Manual refetch
  const refetch = useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);
  
  // Manual mutation
  const mutate = useCallback((newData: any) => {
    setState(prev => ({
      ...prev,
      data: newData,
    }));
    
    // Update cache if this is a GET request
    if (method === 'GET') {
      cache.set(cacheKeyRef.current, {
        data: newData,
        timestamp: Date.now(),
      });
    }
  }, [method]);
  
  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    isFetching: state.isFetching,
    status: state.status,
    refetch,
    mutate,
  };
}

export default useFetch;
