import { createSlice } from '@reduxjs/toolkit';

const coursesSlice = createSlice({
  name: 'courses',
  initialState: [],
  reducers: {
    setCourses: (state, action) => action.payload,
    addCourse: (state, action) => {
      const nextId = state.reduce((maxId, course) => Math.max(maxId, course.id), 0) + 1;
      state.push({ ...action.payload, id: nextId });
    },
    removeCourse: (state, action) =>
      state.filter((course) => course.id !== action.payload),
    setScore: (state, action) => {
      const { id, score } = action.payload;
      const course = state.find((item) => item.id === id);
      if (course) course.score = score;
    },
    restoreCourse: (state, action) => {
      const course = action.payload;
      if (state.some((item) => item.id === course.id)) return;
      // ID tăng dần theo thứ tự thêm môn, nên có thể khôi phục đúng vị trí cũ.
      const insertIndex = state.findIndex((item) => item.id > course.id);
      state.splice(insertIndex === -1 ? state.length : insertIndex, 0, course);
    }
  }
});

export const { setCourses, addCourse, removeCourse, setScore, restoreCourse } =
  coursesSlice.actions;
export const selectCourses = (state) => state.courses;
export default coursesSlice.reducer;
