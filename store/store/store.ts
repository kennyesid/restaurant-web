import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./slices/themeSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import { combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  cart: cartReducer,
  // ...
});
  
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);

// Tipos (opcional)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



// import { configureStore } from "@reduxjs/toolkit";
// import themeReducer from "./slices/themeSlice";
// import cartReducer from "./slices/cartSlice";
// import authReducer from "./slices/authSlice";

// export const store = configureStore({
//   reducer: {
//     theme: themeReducer,
//     cart: cartReducer,
//     auth: authReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
