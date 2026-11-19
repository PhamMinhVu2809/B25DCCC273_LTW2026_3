import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './features/coursesSlice';
import goalReducer from './features/goalSlice';
import undoReducer from './features/undoSlice';
import { loadSaved, saveCourses } from './storage';

const savedCourses = loadSaved();
export const hasSaved = savedCourses !== null;

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    goal: goalReducer,
    undo: undoReducer
  },
  preloadedState: {
    courses: savedCourses ?? []
  }
});

// Chỉ ghi localStorage khi mảng courses đổi tham chiếu.
let previousCourses = store.getState().courses;
store.subscribe(() => {
  const currentCourses = store.getState().courses;
  if (currentCourses !== previousCourses) {
    previousCourses = currentCourses;
    saveCourses(currentCourses);
  }
});
