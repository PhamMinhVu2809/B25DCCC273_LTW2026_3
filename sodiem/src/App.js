import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddCourseForm from './components/AddCourseForm';
import GoalPlanner from './components/GoalPlanner';
import { useNotice } from './context/NoticeContext';
import { useTheme } from './context/ThemeContext';
import { SEMESTERS, formatPoint } from './data';
import { removeCourse, selectCourses, setCourses, setScore } from './features/coursesSlice';
import useFetch from './hooks/useFetch';
import { calcStats, getGrade } from './utils';

const BUILD_TAG = "gp-4073";

const App = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const { data, loading, error } = useFetch('/data/courses.json');

  useEffect(() => {
    if (Array.isArray(data)) dispatch(setCourses(data));
  }, [data, dispatch]);

  // Bài 2 chưa yêu cầu lưu bộ lọc, state được quản lý ngay trong component.
  const semesterState = useSemesterState();
  const visibleCourses = useMemo(() => semesterState.value === 'all'
    ? courses
    : courses.filter((course) => course.semester === semesterState.value), [courses, semesterState.value]);
  const visibleStats = useMemo(() => calcStats(visibleCourses), [visibleCourses]);
  const cumulativeStats = useMemo(() => calcStats(courses), [courses]);

  const handleScore = (id, score) => dispatch(setScore({ id, score }));
  const handleRemove = (course) => {
    dispatch(removeCourse(course.id));
    showNotice(`Đã xóa môn ${course.name}`);
  };

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
      <div className="page-shell">
        <header className="hero-header">
          <div className="hero-copy"><div className="brand-row"><span className="brand-mark">✿</span><span className="brand-name">PINK NOTEBOOK</span><span className="version-chip">TH03 · BÀI 2</span></div><p className="hero-kicker">THE LITTLE PLACE FOR BIG DREAMS</p><h1>Sổ điểm <span>sinh viên</span></h1><p className="hero-description">Theo dõi hành trình học tập, hiểu rõ GPA và lên kế hoạch cho mục tiêu tiếp theo của bạn.</p></div>
          <div className="hero-actions"><div className="hero-sticker"><span>✦</span><strong>Study<br />with love</strong><small>♡ ♡ ♡</small></div><button className="theme-button" type="button" onClick={toggleTheme}><span>{theme === 'light' ? '☾' : '☀'}</span>{theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}</button></div>
          <div className="hero-sparkle sparkle-a">✧</div><div className="hero-sparkle sparkle-b">♡</div>
        </header>
        <main>
          <section className="stats-section panel">
            <div className="section-heading stats-heading"><div><span className="eyebrow">YOUR ACADEMIC SNAPSHOT</span><h2>Tổng quan học tập</h2></div><span className="heading-icon">✧</span></div>
            <div className="stat-highlights"><div className="highlight-card highlight-primary"><span>GPA tích lũy</span><strong>{cumulativeStats.gpa.toFixed(2)}</strong><small>trên thang điểm 4.0</small><span className="highlight-decoration">♡</span></div><div className="highlight-card"><span>Tổng số môn</span><strong>{cumulativeStats.count}</strong><small>môn học đã ghi nhận</small></div><div className="highlight-card"><span>Tổng tín chỉ</span><strong>{cumulativeStats.credits}</strong><small>tín chỉ đã tích lũy</small></div><div className="highlight-card"><span>Xếp loại tích lũy</span><strong className="rank-highlight">{cumulativeStats.rank}</strong><small>theo thang GPA hệ 4</small></div></div>
            <div className="stats-detail"><div className="stats-detail-title"><span>Thống kê theo học kỳ đang xem</span><span className="mini-heart">♥</span></div><div className="stats-lines"><p><span>Số môn:</span><strong>{visibleStats.count}</strong></p><p><span>Tổng tín chỉ:</span><strong>{visibleStats.credits}</strong></p><p><span>GPA (hệ 4):</span><strong>{visibleStats.gpa.toFixed(2)}</strong></p><p><span>Xếp loại:</span><strong>{visibleStats.rank}</strong></p><p><span>GPA tích lũy:</span><strong>{cumulativeStats.gpa.toFixed(2)}</strong></p></div></div>
          </section>
          <section className="panel table-panel">
            <div className="section-heading table-heading"><div><span className="eyebrow">COURSE COLLECTION</span><h2>Bảng điểm của bạn</h2><p className="section-subtitle">Chỉnh sửa điểm trực tiếp và theo dõi kết quả tức thì.</p></div><span className="heading-icon">▤</span></div>
            <div className="table-toolbar"><div className="toolbar-field semester-filter"><label htmlFor="semester-filter">Xem học kỳ</label><select id="semester-filter" value={semesterState.value} onChange={(event) => semesterState.setValue(event.target.value)}><option value="all">Tất cả học kỳ</option>{SEMESTERS.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
            <div className="table-meta-row"><span>Đang hiển thị <strong>{visibleCourses.length}</strong> môn</span></div>
            {loading && courses.length === 0 ? <div className="empty-state loading-state"><span className="loading-flower">✿</span><strong>Đang tải bảng điểm...</strong></div> : error && courses.length === 0 ? <div className="empty-state error-state" role="alert"><strong>Không tải được bảng điểm.</strong></div> : visibleCourses.length === 0 ? <div className="empty-state"><span className="empty-illustration">♡</span><strong>Chưa có môn học nào</strong></div> :
              <div className="table-scroll"><table className="course-table"><thead><tr><th>Mã môn</th><th>Tên môn</th><th>Tín chỉ</th><th>Học kỳ</th><th>Điểm (hệ 10)</th><th>Điểm chữ</th><th>Điểm (hệ 4)</th><th>Xóa</th></tr></thead><tbody>{visibleCourses.map((course) => { const grade = getGrade(Number(course.score)); const failed = grade.letter === 'F'; return <tr key={course.id} className={failed ? 'failed-row' : ''}><td><span className="course-code">{course.code}</span></td><td className="course-name">{course.name}</td><td className="center-cell">{course.credits}</td><td>{course.semester}</td><td><input className="score-input" type="number" min="0" max="10" step="0.1" value={course.score} aria-label={`Điểm ${course.name}`} onChange={(event) => { const score = event.target.valueAsNumber; if (Number.isFinite(score) && score >= 0 && score <= 10) handleScore(course.id, Math.round(score * 10) / 10); }} /></td><td><span className={`grade-pill ${failed ? 'grade-fail' : ''}`}>{failed ? 'F – Học lại' : grade.letter}</span></td><td className="center-cell">{formatPoint(grade.point)}</td><td><button className="icon-button delete-button" type="button" onClick={() => handleRemove(course)} aria-label={`Xóa môn ${course.name}`}><span>×</span></button></td></tr>; })}</tbody></table></div>}
            <div className="table-footnote"><span className="footnote-dot" /> Điểm F được đánh dấu đỏ và cần học lại.</div>
          </section>
          <div className="bottom-grid"><section className="panel add-panel"><div className="section-heading"><div><span className="eyebrow">ADD A NEW COURSE</span><h2>Thêm môn học</h2></div><span className="heading-icon">＋</span></div><p className="section-subtitle">Điền thông tin môn học mới vào sổ điểm của bạn.</p><AddCourseForm /></section><GoalPlanner /></div>
        </main>
        <footer className="page-footer"><span className="footer-flower">✿</span>Made with care · Pink Notebook<span className="footer-build">BUILD {BUILD_TAG.toUpperCase()}</span></footer>
      </div>
    </div>
  );
};

// State học kỳ đơn giản ở Bài 2; useLocalStorage được bổ sung ở Bài 3.
const useSemesterState = () => {
  const [value, setValue] = useState('all');
  return { value, setValue };
};

export default App;
