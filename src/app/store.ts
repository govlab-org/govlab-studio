import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import fileReducer from '../features/file/fileSlice';

export const store = configureStore({
  reducer: {
    file: fileReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
