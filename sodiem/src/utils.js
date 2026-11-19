import { GRADES, RANKS } from './data';

export const getGrade = (score) => GRADES.find((grade) => score >= grade.min) || GRADES[GRADES.length - 1];

export const getRank = (gpa) => {
  const rank = RANKS.find((item) => gpa >= item.min);
  return rank ? rank.title : 'Chưa xếp loại';
};

export const calcStats = (courses) => {
  const result = courses.reduce((stats, course) => {
    const grade = getGrade(Number(course.score));
    stats.credits += Number(course.credits);
    stats.points += Number(course.credits) * grade.point;
    return stats;
  }, { count: courses.length, credits: 0, points: 0 });

  const gpa = result.credits === 0
    ? 0
    : Math.round((result.points / result.credits) * 100) / 100;

  return {
    ...result,
    gpa,
    rank: courses.length === 0 ? 'Chưa xếp loại' : getRank(gpa)
  };
};

export const calcRequired = (courses, target, remaining) => {
  const goal = Number(target);
  const creditsLeft = Number(remaining);
  if (!Number.isFinite(goal) || goal < 0 || goal > 4 ||
      !Number.isInteger(creditsLeft) || creditsLeft < 1 || remaining === '') {
    return 'Hãy nhập GPA mục tiêu (0–4) và số tín chỉ còn lại (từ 1)';
  }

  const stats = calcStats(courses);
  const need = (goal * (stats.credits + creditsLeft) - stats.points) / creditsLeft;
  if (need > 4) return 'Không thể đạt mục tiêu này';
  if (need <= 0) return 'Bạn đã đạt mục tiêu';
  return `Cần đạt trung bình ${need.toFixed(2)} điểm (hệ 4) ở ${creditsLeft} tín chỉ còn lại`;
};
