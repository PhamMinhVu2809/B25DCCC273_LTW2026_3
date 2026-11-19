import { useRef, useState } from 'react';
import { CREDIT_OPTIONS, SEMESTERS } from '../data';

const initialForm = {
  code: '',
  name: '',
  credits: '3',
  semester: 'Học kỳ 1',
  score: ''
};

const AddCourseForm = ({ courses, onAdd }) => {
  const codeRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const code = form.code.trim();
    const name = form.name.trim();
    const normalizedCode = code.toLocaleUpperCase('vi');
    const duplicate = courses.some((course) =>
      course.code.trim().toLocaleUpperCase('vi') === normalizedCode
    );
    const score = form.score === '' ? NaN : Number(form.score);
    const nextErrors = {};

    if (!code) nextErrors.code = 'Hãy nhập mã môn';
    else if (duplicate) nextErrors.code = 'Mã môn đã tồn tại';
    if (!name) nextErrors.name = 'Hãy nhập tên môn';
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      nextErrors.score = 'Điểm phải từ 0 đến 10';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onAdd({
      code: normalizedCode,
      name,
      credits: Number(form.credits),
      semester: form.semester,
      score: Math.round(score * 10) / 10
    });
    setForm(initialForm);
    setErrors({});
    codeRef.current?.focus();
  };

  return (
    <form className="add-course-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="course-code">Mã môn</label>
          <input ref={codeRef} id="course-code" name="code" value={form.code}
            onChange={handleChange} placeholder="Ví dụ: MH401" />
          {errors.code && <small className="field-error" role="alert">{errors.code}</small>}
        </div>
        <div className="form-field">
          <label htmlFor="course-name">Tên môn</label>
          <input id="course-name" name="name" value={form.name}
            onChange={handleChange} placeholder="Nhập tên môn học" />
          {errors.name && <small className="field-error" role="alert">{errors.name}</small>}
        </div>
        <div className="form-field">
          <label htmlFor="course-credits">Số tín chỉ</label>
          <select id="course-credits" name="credits" value={form.credits} onChange={handleChange}>
            {CREDIT_OPTIONS.map((credit) => <option key={credit} value={credit}>{credit} tín chỉ</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="course-semester">Học kỳ</label>
          <select id="course-semester" name="semester" value={form.semester} onChange={handleChange}>
            {SEMESTERS.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="course-score">Điểm hệ 10</label>
          <input id="course-score" name="score" type="number" min="0" max="10" step="0.1"
            value={form.score} onChange={handleChange} placeholder="0.0 – 10.0" />
          {errors.score && <small className="field-error" role="alert">{errors.score}</small>}
        </div>
      </div>
      <button className="primary-button add-button" type="submit"><span>＋</span> Thêm môn học</button>
    </form>
  );
};

export default AddCourseForm;
