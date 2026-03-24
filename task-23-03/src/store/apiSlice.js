import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './globalSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3033/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // જો 401 (Unauthorized) એરર આવે, તો રિફ્રેશ ટોકન ટ્રાય કરો
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      // Refresh token API કોલ કરો
      const refreshResult = await baseQuery(
        { 
          url: '/refresh-token', 
          method: 'POST', 
          body: { token: refreshToken } 
        }, 
        api, 
        extraOptions
      );

      // બેકએન્ડ 'sendSuccess' વાપરે છે એટલે ડેટા 'refreshResult.data.data' માં હશે
      if (refreshResult.data && refreshResult.data.data && refreshResult.data.data.accessToken) {
        const newAccessToken = refreshResult.data.data.accessToken;
        
        // નવો એક્સેસ ટોકન સેવ કરો
        localStorage.setItem('token', newAccessToken);
        
        // જૂની રિક્વેસ્ટ ફરીથી ટ્રાય કરો
        result = await baseQuery(args, api, extraOptions);
      } else {
        // જો રિફ્રેશ ટોકન પણ કામ ના કરે, તો લોગઆઉટ કરો
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'Group', 'User'],
  endpoints: () => ({}), // Endpoints will be injected from apiServices.js
});
