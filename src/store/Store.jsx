import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import CustomizerReducer from './customizer/CustomizerSlice';



// const userProfilePersistConfig = {
//   key: 'userProfileReducer',
//   storage: storage,
// };



// const persistedUserProfileReducer = persistReducer(userProfilePersistConfig, UserProfileReducer);
// const persistedMohallahReducer = persistReducer(mohallaPersistConfig, MohallahReducer);

export const store = configureStore({
  reducer: {
    customizer: CustomizerReducer,
    // userProfile: UserProfileReducer,
    counts: CountReducer
   
  

  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

// export const persistor = persistStore(store);

export default { store};