import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  isLoggedIn: !!localStorage.getItem('token'),
  userName: localStorage.getItem('userName') || ''
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    addLog: (state, action) => {
      state.logs = [action.payload, ...state.logs];
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    setLoginStatus: (state, action) => {
      const { status, name } = action.payload;
      state.isLoggedIn = status;
      if (name) {
        state.userName = name;
        localStorage.setItem('userName', name);
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userName = '';
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
    }
  }
});

export const { addLog, clearLogs, setLoginStatus, logout } = globalSlice.actions;
export default globalSlice.reducer;
