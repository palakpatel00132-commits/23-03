import { apiSlice } from './apiSlice';

// Common CRUD endpoints generator
const createCrudEndpoints = (builder, resource, tagType) => ({
  [`get${resource}s`]: builder.query({
    query: (params) => ({
      url: `/${resource.toLowerCase()}s`,
      params, // સર્ચ અને અન્ય ક્વેરી પેરામીટર્સ માટે
    }),
    providesTags: [tagType],
    transformResponse: (response) => response.data || [],
  }),
  [`add${resource}`]: builder.mutation({
    query: (newData) => ({
      url: `/${resource.toLowerCase()}s`,
      method: 'POST',
      body: newData,
    }),
    invalidatesTags: [tagType],
    transformResponse: (response) => response.data,
  }),
  [`update${resource}`]: builder.mutation({
    query: ({ id, ...patch }) => ({
      url: `/${resource.toLowerCase()}s/${id}`,
      method: 'PUT',
      body: patch,
    }),
    invalidatesTags: [tagType],
    transformResponse: (response) => response.data,
  }),
  [`delete${resource}`]: builder.mutation({
    query: (id) => ({
      url: `/${resource.toLowerCase()}s/${id}`,
      method: 'DELETE',
    }),
    invalidatesTags: [tagType],
    transformResponse: (response) => response.data,
  }),
});

export const apiServices = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Auth Endpoints (Custom)
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response.data,
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.data,
    }),
    logout: builder.mutation({
      query: (body) => ({
        url: '/logout',
        method: 'POST',
        body,
      }),
    }),

    getUsers: builder.query({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
      transformResponse: (response) => response.data || [],
    }),

    // Common CRUD for Tasks
    ...createCrudEndpoints(builder, 'Task', 'Task'),

    // Common CRUD for Groups
    ...createCrudEndpoints(builder, 'Group', 'Group'),

    // Extra custom endpoint for Groups
    splitExpenses: builder.mutation({
      query: (splitData) => ({
        url: '/groups/split',
        method: 'POST',
        body: splitData,
      }),
      invalidatesTags: ['Group'],
      transformResponse: (response) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetUsersQuery,
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetGroupsQuery,
  useAddGroupMutation, 
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useSplitExpensesMutation,
} = apiServices;
