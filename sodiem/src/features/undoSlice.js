import { createSlice } from '@reduxjs/toolkit';

const undoSlice = createSlice({
  name: 'undo',
  initialState: { lastDeleted: null },
  reducers: {
    setLastDeleted: (state, action) => {
      state.lastDeleted = action.payload;
    },
    clearLastDeleted: (state) => {
      state.lastDeleted = null;
    }
  }
});

export const { setLastDeleted, clearLastDeleted } = undoSlice.actions;
export const selectLastDeleted = (state) => state.undo.lastDeleted;
export default undoSlice.reducer;
