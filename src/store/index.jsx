
  import { configureStore, combineReducers } from '@reduxjs/toolkit';
  import themeConfigSlice from './themeConfigSlice';
  import userProfileReducer from "../store/userProfile/UserProfileSlice";
  import { persistReducer, persistStore } from 'redux-persist';
  import storage from 'redux-persist/lib/storage'; 
  import countReducer from "./count/CountSlice"


  const persistConfig = {
    key: 'root',
    storage, 
  whitelist: ['userProfile']

  };
  const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    userProfile: userProfileReducer,
    counts: countReducer
  });


  const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'], 
        },
      }),
  });

  const persistor = persistStore(store);
  export { store, persistor };