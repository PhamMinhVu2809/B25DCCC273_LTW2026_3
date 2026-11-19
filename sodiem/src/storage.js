const COURSES_KEY = 'ltw_sodiem_courses';

export const loadSaved = () => {
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    if (raw === null) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const isValid = parsed.every((course) =>
      course &&
      Number.isInteger(course.id) &&
      typeof course.code === 'string' &&
      typeof course.name === 'string' &&
      Number.isFinite(Number(course.credits)) &&
      typeof course.semester === 'string' &&
      Number.isFinite(Number(course.score))
    );
    return isValid ? parsed : null;
  } catch (error) {
    console.warn('Không thể đọc bảng điểm đã lưu:', error);
    return null;
  }
};

export const saveCourses = (courses) => {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (error) {
    console.warn('Không thể lưu bảng điểm:', error);
  }
};
