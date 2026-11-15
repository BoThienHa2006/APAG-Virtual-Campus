# 🎓 APAG Virtual Campus — Website 3D nhập vai

Dự án tham quan ảo Học viện Hành chính và Quản trị công (APAG). Đây là **phiên bản thử nghiệm 4.0**, không phải website chính thức của Học viện. Mô hình công trình hiện là minh họa, không phải bản đồ kiến trúc thực tế.

## Các tính năng hiện có

- Nhân vật 3D, di chuyển W/A/S/D, phím mũi tên hoặc điều khiển cảm ứng.
- Shift để chạy, Space để nhảy, kéo chuột để xoay camera, lăn chuột để thu phóng.
- Bản đồ nhỏ, va chạm đơn giản với tòa nhà, tương tác bằng phím E.
- Chuyển đổi giữa bảy địa điểm có nguồn tham khảo từ website Học viện.
- Hệ thống xem ảnh 360° (đang chờ bổ sung ảnh panorama được cấp phép).

## Mở và chạy dự án trên máy tính

Cài [Node.js](https://nodejs.org/) phiên bản 20 trở lên, sau đó mở thư mục dự án trong VS Code và chạy:

```bash
npm run dev
```

Truy cập **http://localhost:8000** bằng Chrome/Edge. Máy cần Internet vì thư viện Three.js được tải qua CDN.

Không mở trực tiếp `index.html` từ máy bằng `file://`, vì chương trình cần tải `data/campuses.json` qua máy chủ HTTP.

## Kiểm thử

```bash
npm test
```

Đây chỉ là kiểm tra mã và cấu trúc. Vẫn cần tự kiểm thử chức năng đồ họa trên Chrome/Edge và điện thoại.

## Bố cục repository

```text
APAG-Virtual-Campus/
├── index.html                  # Giao diện web
├── main.js                     # Điều khiển và thế giới 3D
├── data/campuses.json          # Dữ liệu bảy địa điểm
├── assets/                     # Thư viện ảnh / mô hình được cấp phép
├── scripts/serve.mjs           # Máy chủ thử nghiệm tại máy
├── tests/project.test.mjs      # Kiểm thử tự động
├── docs/PROJECT_STATUS.md      # Tiến độ và kế hoạch
├── AGENTS.md                   # Quy tắc để Codex tiếp tục lập trình
├── .github/workflows/ci.yml   # Kiểm thử tự động trên GitHub
└── package.json
```

## Làm việc với Codex

1. Mở repository này trên GitHub.
2. Trong Codex, chọn GitHub repository **BoThienHa2006/APAG-Virtual-Campus**.
3. Yêu cầu Codex đọc `AGENTS.md` và `docs/PROJECT_STATUS.md` trước khi thay đổi mã.
4. Đề nghị tạo **nhánh mới và Pull Request** thay vì sửa trực tiếp nhánh `main`.
5. Xem kết quả, kiểm thử rồi mới đồng ý hợp nhất PR.

Ví dụ yêu cầu Codex:

> Đọc AGENTS.md và docs/PROJECT_STATUS.md. Tiếp tục nâng cấp APAG Virtual Campus lên 5.0, ưu tiên giao diện quản trị chỉnh sửa điểm tham quan, nhưng không được làm mất các chức năng 4.0. Chạy npm test, kiểm thử trình duyệt khi có thể và tạo Pull Request để tôi duyệt. Không tự triển khai website công khai.

## Tình trạng triển khai

Repository hiện dùng để quản lý mã nguồn. **Chưa có trang quản trị trực tuyến, đăng nhập, nhiều người chơi hoặc website đã triển khai công khai.** Việc công khai website cần cấu hình GitHub Pages hoặc hosting riêng.

## Nguồn dữ liệu và bản quyền

- Danh sách địa điểm: https://apag.edu.vn/Pages/lien-he.aspx
- Không chứa ảnh panorama thật hoặc ảnh kiến trúc Học viện chưa được cấp phép.
- Chỉ đưa dữ liệu và hình ảnh có quyền sử dụng hợp pháp vào repository, nhất là khi repository ở chế độ Public.
