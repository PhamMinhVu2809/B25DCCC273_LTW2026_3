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
