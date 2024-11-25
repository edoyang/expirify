import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    name: '', // Initial state for the user's name
  },
  reducers: {
    setName: (state, action) => {
      state.name = action.payload; // Update the user's name
    },
    clearName: (state) => {
      state.name = ''; // Clear the user's name
    },
  },
});

// Export actions for dispatching
export const { setName, clearName } = userSlice.actions;

// Export the reducer to be used in the store
export default userSlice.reducer;
