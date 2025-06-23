import { configureStore } from "@reduxjs/toolkit";
import platformStatusReducer from "./features/platformStatusSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      platformStatus: platformStatusReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
