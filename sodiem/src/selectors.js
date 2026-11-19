import { createSelector } from '@reduxjs/toolkit';
import { calcStats } from './utils';
import { selectCourses } from './features/coursesSlice';

// Selector chỉ tính lại khi tham chiếu mảng courses thực sự thay đổi.
export const selectCourseStats = createSelector([selectCourses], (courses) =>
  calcStats(courses)
);
