import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PlatformStatus = {
  [platformId: string]: {
    hasNew: boolean;
  };
};

const initialState: PlatformStatus = {
  gmail: { hasNew: false },
  messenger: { hasNew: false },
  instagram: { hasNew: false },
  slack: { hasNew: false },
};

export const platformStatusSlice = createSlice({
  name: "platformStatus",
  initialState,
  reducers: {
    setHasNew: (
      state,
      action: PayloadAction<{ platformId: string; hasNew: boolean }>
    ) => {
      const { platformId, hasNew } = action.payload;
      if (state[platformId]) {
        state[platformId].hasNew = hasNew;
      }
    },
  },
});

// ✅ Export only the reducer
export const { setHasNew } = platformStatusSlice.actions;
export default platformStatusSlice.reducer;
