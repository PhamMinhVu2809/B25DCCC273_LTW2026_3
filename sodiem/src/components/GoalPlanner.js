import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCourses } from '../features/coursesSlice';
import { selectGoal, setRemaining, setTarget } from '../features/goalSlice';
import { calcRequired } from '../utils';

const GoalPlanner = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const { target, remaining } = useSelector(selectGoal);

  const result = useMemo(
    () => calcRequired(courses, target, remaining),
    [courses, target, remaining]
  );

  const isWarning = result.startsWith('Hãy nhập') || result.startsWith('Không thể');
  const isAchieved = result === 'Bạn đã đạt mục tiêu';

  return (
    <section className="panel goal-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LẬP KẾ HOẠCH</span>
          <h2>Mục tiêu GPA</h2>
        </div>
        <span className="heading-icon" aria-hidden="true">◎</span>
      </div>

      <div className="goal-fields">
        <div className="form-field">
          <label htmlFor="goal-target">GPA mục tiêu (hệ 4)</label>
          <input
            id="goal-target"
            type="number"
            min="0"
            max="4"
            step="0.01"
            value={target}
            onChange={(event) => dispatch(setTarget(event.target.value))}
          />
        </div>
        <div className="form-field">
          <label htmlFor="goal-remaining">Số tín chỉ còn lại</label>
          <input
            id="goal-remaining"
            type="number"
            min="1"
            step="1"
            value={remaining}
            onChange={(event) => dispatch(setRemaining(event.target.value))}
          />
        </div>
      </div>

      <div className={`goal-result ${isWarning ? 'goal-warning' : ''} ${isAchieved ? 'goal-success' : ''}`} aria-live="polite">
        <span className="goal-result-icon" aria-hidden="true">{isAchieved ? '✓' : '✦'}</span>
        <p>{result}</p>
      </div>
      <p className="goal-hint">Kết quả được cập nhật ngay khi bạn thay đổi điểm hoặc mục tiêu.</p>
    </section>
  );
};

export default GoalPlanner;
