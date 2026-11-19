import React, { useRef } from 'react';
import { formatPoint } from '../data';
import { getGrade } from '../utils';

const CourseRow = ({ course, onScore, onRemove }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const grade = getGrade(Number(course.score));
  const isFailed = grade.letter === 'F';

  return (
    <tr className={isFailed ? 'failed-row' : ''}>
      <td data-label="Mã môn"><span className="course-code">{course.code}</span></td>
      <td data-label="Tên môn" className="course-name">{course.name}</td>
      <td data-label="Tín chỉ" className="center-cell">{course.credits}</td>
      <td data-label="Học kỳ">{course.semester}</td>
      <td data-label="Điểm hệ 10">
        <input
          className="score-input"
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={course.score}
          aria-label={`Điểm ${course.name}`}
          onChange={(event) => {
            const nextScore = event.target.valueAsNumber;
            if (Number.isFinite(nextScore) && nextScore >= 0 && nextScore <= 10) {
              onScore(course.id, Math.round(nextScore * 10) / 10);
            }
          }}
        />
      </td>
      <td data-label="Điểm chữ">
        <span className={`grade-pill ${isFailed ? 'grade-fail' : ''}`}>
          {isFailed ? 'F – Học lại' : grade.letter}
        </span>
      </td>
      <td data-label="Điểm hệ 4" className="center-cell">{formatPoint(grade.point)}</td>
      <td data-label="Số lần render" className="center-cell render-count">{renderCount.current}</td>
      <td data-label="Thao tác">
        <button
          className="icon-button delete-button"
          type="button"
          onClick={() => onRemove(course)}
          aria-label={`Xóa môn ${course.name}`}
          title={`Xóa ${course.name}`}
        >
          <span aria-hidden="true">×</span>
        </button>
      </td>
    </tr>
  );
};

export default React.memo(CourseRow);
