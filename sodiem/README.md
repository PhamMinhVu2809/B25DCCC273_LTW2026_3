# Bài 2 – Context API và Redux Toolkit

Phiên bản này tiếp tục từ Bài 1: chuyển quản lý môn học từ `useReducer` sang Redux Toolkit, thêm ThemeContext, NoticeContext và tính mục tiêu GPA.

## Chạy chương trình

```bash
npm install
npm start
```

## Đã thực hiện

- `ThemeProvider` / `useTheme`: đổi sáng/tối, `toggleTheme` dùng `useCallback`, context value dùng `useMemo`.
- `NoticeProvider` / `useNotice`: thông báo tự ẩn sau 3 giây; lần gọi mới làm mới thời gian.
- Redux Toolkit: `coursesSlice`, `goalSlice`, `configureStore`, `useSelector`, `useDispatch`.
- `AddCourseForm` tự đọc danh sách từ Redux, tự dispatch và gọi `showNotice`.
- `GoalPlanner` tính số điểm hệ 4 cần đạt ở các tín chỉ còn lại.
- Các chức năng Bài 1 vẫn hoạt động.

## Kiểm tra nhanh

- Mặc định 3.2 GPA và 20 tín chỉ còn lại: cần đạt trung bình 3.76.
- Đổi mục tiêu 2.5: cần đạt trung bình 1.87.
- Học kỳ 1: 11 tín chỉ, GPA 3.10; Học kỳ 3: 12 tín chỉ, GPA 2.50.

Bài 3 sẽ bổ sung localStorage, tìm kiếm debounce, phím tắt, tối ưu render và thử thách thêm.
