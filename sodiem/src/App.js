import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddCourseForm from './components/AddCourseForm';
import CourseRow from './components/CourseRow';
import GoalPlanner from './components/GoalPlanner';
import { useNotice } from './context/NoticeContext';
import { useTheme } from './context/ThemeContext';
import { GRADES, SEMESTERS, formatPoint } from './data';
import { clearLastDeleted, selectLastDeleted, setLastDeleted } from './features/undoSlice';
import { removeCourse, restoreCourse, selectCourses, setCourses, setScore } from './features/coursesSlice';
import { hasSaved } from './store';
import useDebounce from './hooks/useDebounce';
import useFetch from './hooks/useFetch';
import useLocalStorage from './hooks/useLocalStorage';
import { selectCourseStats } from './selectors';
import { calcStats, getGrade } from './utils';

const BUILD_TAG = "gp-4073";

const App = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const cumulativeStats = useSelector(selectCourseStats);
  const lastDeleted = useSelector(selectLastDeleted);
  const { theme, toggleTheme } = useTheme();
  const showNotice = useNotice();
  const { data: sampleCourses, loading, error } = useFetch('/data/courses.json');
  const didInitialize = useRef(hasSaved);

  const [semester, setSemester] = useLocalStorage('ltw_sodiem_semester', 'all');
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState('none');
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!didInitialize.current && !hasSaved && Array.isArray(sampleCourses)) {
      didInitialize.current = true;
      dispatch(setCourses(sampleCourses));
    }
  }, [dispatch, sampleCourses]);

  useEffect(() => {
    if (cumulativeStats.count > 0) {
      document.title = `GPA ${cumulativeStats.gpa.toFixed(2)} – Sổ điểm`;
    } else {
      document.title = 'Sổ điểm';
    }
  }, [cumulativeStats]);

  const semesterCourses = useMemo(() => {
    if (semester === 'all') return courses;
    return courses.filter((course) => course.semester === semester);
  }, [courses, semester]);

  const visibleStats = useMemo(() => calcStats(semesterCourses), [semesterCourses]);

  const gradeDistribution = useMemo(
    () => GRADES.map((grade) => ({
      ...grade,
      count: semesterCourses.filter((course) => getGrade(Number(course.score)).letter === grade.letter).length
    })),
    [semesterCourses]
  );

  const displayedCourses = useMemo(() => {
    const keyword = debouncedSearch.trim().toLocaleLowerCase('vi');
    const filtered = semesterCourses.filter((course) => {
      if (!keyword) return true;
      return (
        course.name.toLocaleLowerCase('vi').includes(keyword) ||
        course.code.toLocaleLowerCase('vi').includes(keyword)
      );
    });

    if (sortDirection === 'none') return filtered;
    return [...filtered].sort((a, b) =>
      sortDirection === 'asc' ? a.score - b.score : b.score - a.score
    );
  }, [semesterCourses, debouncedSearch, sortDirection]);

  const handleCourseShift = (event) => {
    setSearch(event.target.value);
  };

  const handleScoreChange = useCallback((id, score) => {
    dispatch(setScore({ id, score }));
  }, [dispatch]);

  const handleRemove = useCallback((course) => {
    dispatch(setLastDeleted({ course }));
    dispatch(removeCourse(course.id));
    showNotice(`Đã xóa môn ${course.name}`);
  }, [dispatch, showNotice]);

  const handleUndo = useCallback(() => {
    if (!lastDeleted) return;
    dispatch(restoreCourse(lastDeleted.course));
    showNotice(`Đã khôi phục môn ${lastDeleted.course.name}`);
    dispatch(clearLastDeleted());
  }, [dispatch, lastDeleted, showNotice]);

  const handleReset = useCallback(() => {
    if (!Array.isArray(sampleCourses)) return;
    dispatch(setCourses(sampleCourses));
    dispatch(clearLastDeleted());
    showNotice('Đã đặt lại dữ liệu mẫu');
  }, [dispatch, sampleCourses, showNotice]);

  const handleSort = () => {
    setSortDirection((current) => {
      if (current === 'none' || current === 'asc') return 'desc';
      return 'asc';
    });
  };

  const handleExport = () => {
    const headers = ['Mã môn', 'Tên môn', 'Tín chỉ', 'Học kỳ', 'Điểm hệ 10', 'Điểm chữ', 'Điểm hệ 4'];
    const rows = displayedCourses.map((course) => {
      const grade = getGrade(Number(course.score));
      return [
        course.code,
        course.name,
        course.credits,
        course.semester,
        Number(course.score).toFixed(1),
        grade.letter,
        formatPoint(grade.point)
      ];
    });
    const escapeCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'so-diem-sinh-vien.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isTyping = ['input', 'textarea', 'select'].includes(tagName) || target?.isContentEditable;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === 'Escape' && target === searchRef.current) {
        setSearch('');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const waitingForFirstLoad = !hasSaved && courses.length === 0 && loading;
  const firstLoadFailed = !hasSaved && courses.length === 0 && Boolean(error) && !Array.isArray(sampleCourses);

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <div className="page-shell">
        <header className="hero-header">
          <div className="hero-copy">
            <div className="brand-row">
              <span className="brand-mark" aria-hidden="true">✿</span>
              <span className="brand-name">PINK NOTEBOOK</span>
              <span className="version-chip">TH03 · REACT</span>
            </div>
            <p className="hero-kicker">THE LITTLE PLACE FOR BIG DREAMS</p>
            <h1>Sổ điểm <span>sinh viên</span></h1>
            <p className="hero-description">
              Theo dõi hành trình học tập, hiểu rõ GPA và lên kế hoạch cho mục tiêu tiếp theo của bạn.
            </p>
          </div>
          <div className="hero-actions">
            <div className="hero-sticker" aria-hidden="true">
              <span>✦</span>
              <strong>Study<br />with love</strong>
              <small>♡ ♡ ♡</small>
            </div>
            <button className="theme-button" type="button" onClick={toggleTheme}>
              <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
              {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            </button>
          </div>
          <div className="hero-sparkle sparkle-a" aria-hidden="true">✧</div>
          <div className="hero-sparkle sparkle-b" aria-hidden="true">♡</div>
        </header>

        <main>
          <section className="stats-section panel">
            <div className="section-heading stats-heading">
              <div>
                <span className="eyebrow">YOUR ACADEMIC SNAPSHOT</span>
                <h2>Tổng quan học tập</h2>
              </div>
              <span className="heading-icon" aria-hidden="true">✧</span>
            </div>

            <div className="stat-highlights">
              <div className="highlight-card highlight-primary">
                <span>GPA tích lũy</span>
                <strong>{cumulativeStats.gpa.toFixed(2)}</strong>
                <small>trên thang điểm 4.0</small>
                <span className="highlight-decoration" aria-hidden="true">♡</span>
              </div>
              <div className="highlight-card">
                <span>Tổng số môn</span>
                <strong>{cumulativeStats.count}</strong>
                <small>môn học đã ghi nhận</small>
              </div>
              <div className="highlight-card">
                <span>Tổng tín chỉ</span>
                <strong>{cumulativeStats.credits}</strong>
                <small>tín chỉ đã tích lũy</small>
              </div>
              <div className="highlight-card">
                <span>Xếp loại tích lũy</span>
                <strong className="rank-highlight">{cumulativeStats.rank}</strong>
                <small>theo thang GPA hệ 4</small>
              </div>
            </div>

            <div className="stats-detail">
              <div className="stats-detail-title">
                <span>Thống kê theo học kỳ đang xem</span>
                <span className="mini-heart" aria-hidden="true">♥</span>
              </div>
              <div className="stats-lines">
                <p><span>Số môn:</span><strong>{visibleStats.count}</strong></p>
                <p><span>Tổng tín chỉ:</span><strong>{visibleStats.credits}</strong></p>
                <p><span>GPA (hệ 4):</span><strong>{visibleStats.gpa.toFixed(2)}</strong></p>
                <p><span>Xếp loại:</span><strong>{visibleStats.rank}</strong></p>
                <p><span>GPA tích lũy:</span><strong>{cumulativeStats.gpa.toFixed(2)}</strong></p>
              </div>
            </div>

            <div className="distribution-block">
              <div className="distribution-title">
                <h3>Phân bố điểm chữ</h3>
                <span>Theo học kỳ đang xem</span>
              </div>
              <ul className="distribution-list">
                {gradeDistribution.map((item) => (
                  <li key={item.letter}>
                    <span className="distribution-grade">{item.letter}</span>
                    <span className="distribution-count">{item.count}</span>
                    <span className="distribution-track">
                      <span className="distribution-bar" style={{ width: `${24 * item.count}px` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel table-panel">
            <div className="section-heading table-heading">
              <div>
                <span className="eyebrow">COURSE COLLECTION</span>
                <h2>Bảng điểm của bạn</h2>
                <p className="section-subtitle">Chỉnh sửa điểm trực tiếp và theo dõi kết quả tức thì.</p>
              </div>
              <span className="heading-icon" aria-hidden="true">▤</span>
            </div>

            <div className="table-toolbar">
              <div className="toolbar-field semester-filter">
                <label htmlFor="semester-filter">Xem học kỳ</label>
                <select
                  id="semester-filter"
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                >
                  <option value="all">Tất cả học kỳ</option>
                  {SEMESTERS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="toolbar-field search-field">
                <label htmlFor="course-search">Tìm môn học</label>
                <div className="search-input-wrap">
                  <span aria-hidden="true">⌕</span>
                  <input
                    ref={searchRef}
                    id="course-search"
                    type="search"
                    value={search}
                    onChange={handleCourseShift}
                    placeholder="Nhập tên hoặc mã môn..."
                  />
                  <kbd>/</kbd>
                </div>
              </div>
            </div>

            <div className="table-meta-row">
              <span>Tìm thấy <strong>{displayedCourses.length}</strong> môn</span>
              <div className="table-actions">
                {lastDeleted && (
                  <button className="soft-button" type="button" onClick={handleUndo}>
                    ↶ Hoàn tác
                  </button>
                )}
                <button className="soft-button" type="button" onClick={handleExport}>
                  ⇩ Xuất CSV
                </button>
                <button className="soft-button reset-button" type="button" onClick={handleReset} disabled={!Array.isArray(sampleCourses)}>
                  ↻ Đặt lại dữ liệu mẫu
                </button>
              </div>
            </div>

            {waitingForFirstLoad ? (
              <div className="empty-state loading-state">
                <span className="loading-flower" aria-hidden="true">✿</span>
                <strong>Đang tải bảng điểm...</strong>
                <span>Một chút xíu thôi, dữ liệu đang được chuẩn bị.</span>
              </div>
            ) : firstLoadFailed ? (
              <div className="empty-state error-state" role="alert">
                <strong>Không tải được bảng điểm.</strong>
                <span>Kiểm tra file public/data/courses.json rồi tải lại trang nhé.</span>
              </div>
            ) : displayedCourses.length === 0 ? (
              <div className="empty-state">
                <span className="empty-illustration" aria-hidden="true">♡</span>
                <strong>{courses.length === 0 ? 'Chưa có môn học nào' : 'Không tìm thấy môn học phù hợp'}</strong>
                <span>{courses.length === 0 ? 'Thêm môn học đầu tiên ở biểu mẫu bên dưới nhé.' : 'Thử đổi từ khóa tìm kiếm hoặc chọn học kỳ khác.'}</span>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="course-table">
                  <thead>
                    <tr>
                      <th scope="col">Mã môn</th>
                      <th scope="col">Tên môn</th>
                      <th scope="col">Tín chỉ</th>
                      <th scope="col">Học kỳ</th>
                      <th scope="col" aria-sort={sortDirection === 'none' ? 'none' : sortDirection === 'asc' ? 'ascending' : 'descending'}>
                        <button className="sort-button" type="button" onClick={handleSort}>
                          Điểm (hệ 10) <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}</span>
                        </button>
                      </th>
                      <th scope="col">Điểm chữ</th>
                      <th scope="col">Điểm (hệ 4)</th>
                      <th scope="col">Số lần render</th>
                      <th scope="col">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedCourses.map((course) => (
                      <CourseRow
                        key={course.id}
                        course={course}
                        onScore={handleScoreChange}
                        onRemove={handleRemove}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="table-footnote">
              <span className="footnote-dot" /> Điểm F được đánh dấu đỏ và cần học lại.
              <span className="footnote-shortcut">Phím tắt: <kbd>/</kbd> tìm kiếm · <kbd>Esc</kbd> xóa tìm kiếm</span>
            </div>
          </section>

          <div className="bottom-grid">
            <section className="panel add-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">ADD A NEW COURSE</span>
                  <h2>Thêm môn học</h2>
                </div>
                <span className="heading-icon" aria-hidden="true">＋</span>
              </div>
              <p className="section-subtitle">Điền thông tin môn học mới vào sổ điểm của bạn.</p>
              <AddCourseForm />
            </section>
            <GoalPlanner />
          </div>
        </main>

        <footer className="page-footer">
          <span className="footer-flower" aria-hidden="true">✿</span>
          Made with care · Pink Notebook
          <span className="footer-build">BUILD {BUILD_TAG.toUpperCase()}</span>
        </footer>
      </div>
    </div>
  );
};

export default App;
