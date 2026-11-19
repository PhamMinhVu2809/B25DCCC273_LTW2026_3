import { GRADES, RANKS } from './data';

export const getGrade = (score) =>
  GRADES.find((grade) => score >= grade.min) || GRADES[GRADES.length - 1];

export const getRank = (gpa) =>
  RANKS.find((rank) => gpa >= rank.min)?.title || 'Chưa xếp loại';

export const calcStats = (courses) => {
  const count = courses.length;
  const credits = courses.reduce((total, course) => total + Number(course.credits), 0);
  const points = courses.reduce(
    (total, course) => total + Number(course.credits) * getGrade(Number(course.score)).point,
    0
  );
  const gpa = credits > 0 ? Math.round((points / credits) * 100) / 100 : 0;

  return {
    count,
    credits,
    points,
    gpa,
    rank: count === 0 ? 'Chưa xếp loại' : getRank(gpa)
  };
};

export const calcRequired = (courses, target, remaining) => {
  const targetNumber = target === '' ? NaN : Number(target);
  const remainingNumber = remaining === '' ? NaN : Number(remaining);

  if (
    !Number.isFinite(targetNumber) ||
    targetNumber < 0 ||
    targetNumber > 4 ||
    !Number.isInteger(remainingNumber) ||
    remainingNumber < 1
  ) {
    return 'Hãy nhập GPA mục tiêu (0–4) và số tín chỉ còn lại (từ 1)';
  }

  const current = calcStats(courses);
  const need =
    (targetNumber * (current.credits + remainingNumber) - current.points) /
    remainingNumber;

  if (need > 4) return 'Không thể đạt mục tiêu này';
  if (need <= 0) return 'Bạn đã đạt mục tiêu';

  return `Cần đạt trung bình ${need.toFixed(2)} điểm (hệ 4) ở ${remainingNumber} tín chỉ còn lại`;
};
