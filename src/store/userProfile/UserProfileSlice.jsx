import { createSlice } from '@reduxjs/toolkit';

// Define proper initial state structure
const initialState = {
  user: null,
  token: null,   
  status: 'idle' 
};

export const UserProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = 'succeeded';
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    resetUser: () => {
      return initialState;
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setError: (state) => {
      state.status = 'failed';
    }
  },
});

export const { setUser, setToken, resetUser, setLoading, setError } = UserProfileSlice.actions;
export const selectCurrentUser = (state) => state.userProfile.user;
export const selectCurrentToken = (state) => state.userProfile.token;
export const selectAuthStatus = (state) => state.userProfile.status;


export default UserProfileSlice.reducer;