# 🌌 FinCopilot - Hệ Sinh Thái Hoàn Chỉnh Về Quản Lý Tài Chính Cá Nhân

> **Cố vấn Phân bổ Tài sản & Tích sản Thông minh dành cho Lập trình viên và Thế hệ trẻ Việt Nam.**

**FinCopilot** là một nền tảng quản lý tài chính cá nhân full-stack sâu sắc, hỗ trợ người dùng từ khi bắt đầu lập nghiệp, thiết kế bệ đỡ an toàn tài chính, định cấu hình danh mục tích sản định kỳ (DCA), cho đến thiết lập các mô hình kinh doanh phụ (Side Hustle) để gia tăng thu nhập chủ động. Hệ thống tích hợp nhuần nhuyễn trí tuệ nhân tạo (Generative AI) và cổng nhận giao dịch tự động qua Telegram/n8n để mang lại một trải nghiệm tối giản tuyệt đối nhưng cực kỳ khoa học.

---

## 🎨 Điểm Nhấn Thiết Kế (Design Philosophy)

*   **Cosmic Midnight Canvas**: Trải nghiệm giao diện được bao phủ bởi chiều không gian tối huyền bí phân rã hạt bụi sao tương tác sinh động (`BackgroundUniverse`), kết hợp với sắc xanh ngọc lục bảo tinh tế (`emerald-500`) tạo cảm giác tin cậy và đậm chất công nghệ cao.
*   **Trực Quan Hóa Tối Đa**: Toàn bộ biểu đồ phân bổ tài sản, tăng trưởng kép phi tuyến tính, và kịch bản đối chiếu tài sản được vẽ trực tiếp bằng `Recharts` hiệu năng cao, tối ưu hiển thị responsive đa điểm chạm từ thiết bị di động đến màn hình Ultra-wide.
*   **Không Thừa, Không Thiếu**: Chú trọng tính chân thực tuyệt đối. Không lạm dụng dữ liệu giả lập (Larping), không hiện log terminal rác, mà thể hiện giá trị chân thực thông qua thiết kế chữ (Typography Pairings) thanh thoát giữa bộ đôi **Inter** hiển thị và **JetBrains Mono** chuyên dụng cho số liệu dòng tiền.

---

## ⚡ Công Nghệ & Kiến Trúc (Tech Stack)

### 1. Frontend (Giao Diện Người Dùng)
*   **React 19 & TypeScript 5**: Sử dụng kiến trúc hàm và Hook hiện đại nhất. Các thành phần được Module hóa tối đa tránh xung đột hàng tỷ token trong quá trình biên dịch.
*   **Tailwind CSS v4.0 (Vite-Native)**: Ứng dụng plugin `@tailwindcss/vite` thế hệ mới cho phép nạp tài nguyên cực nhanh, cấu hình chủ đề (`@theme`) mượt mà và tối ưu hóaCSS Production đầu ra.
*   **Motion React (Framer Motion v12)**: Xử lý hiệu ứng chuyển trang mượt mà, hoạt cảnh nạp bước Onboarding từng phần tinh tế.
*   **Recharts**: Phát triển độc lập các Wrapper bảo vệ vòng đời component (Mounted Checks), giải quyết triệt để lỗi không đồng bộ kích thước canvas hiển thị trên iframe (`Warning: The width (-1) and height (-1) of chart should be greater than 0`).

### 2. Backend (Máy Chủ Tích Hợp)
*   **Express 4.x & ESM Execution**: Máy chủ Express chạy trực tiếp bằng trình thông dịch siêu tốc `tsx` ở môi trường Dev.
*   **CJS Build Model**: Trình đóng gói `esbuild` tự động tối ưu hóa và biên dịch toàn bộ cấu trúc máy chủ TypeScript thành tệp đơn nhất `/dist/server.cjs` ở môi trường Production, loại bỏ hoàn toàn các lỗi xung đột đường dẫn tương đối của ES Modules trên Node.js.
*   **Cổng API Webhook**: Cung cấp API endpoint hiệu suất cao `/api/webhook/transaction` hỗ trợ khớp lệnh đẩy giao dịch tự động theo thời gian thực từ Telegram Bot hoặc kịch bản n8n cá nhân hóa.

### 3. Trí Tuệ Nhân Tạo (AI Flight Deck)
*   **Google GenAI SDK (`@google/genai`)**: Kết nối trực tiếp đến mô hình ngôn ngữ lớn **Gemini-3.5-Flash** với cấu hình lời nhắc hệ thống nghiêm ngặt (System Prompts) trả về JSON chính xác.
*   **Smart Heuristics Fallback Engine**: Trong trường hợp không có mạng Internet, không có API Key, hoặc vượt hạn mức (Quota limit), bộ lọc heuristic thông minh tại máy chủ sẽ tự động kích hoạt để tính toán phân bổ dòng tiền và đưa ra phân tích tài chính sâu sắc bằng tiếng Việt dựa theo quy chuẩn tài chính của người trẻ.

### 4. Cơ Sở Dữ Liệu & Xác Thực (Database & Auth)
*   **Firebase Firestore**: Đồng bộ cấu trúc dữ liệu thời gian thực cho hồ sơ người dùng, danh mục tài khoản, nhật ký check-in hành vi thu chi, và giao dịch ledger.
*   **Firebase Authentication**: Cổng xác thực bảo mật tiêu chuẩn cao tích hợp màn hình đăng nhập thanh lịch.
*   **Local State Engine Backdrop**: Khi Firebase chưa liên kết hoặc cấu hình rỗng, hệ thống tự động bọc dòng dữ liệu fallback mặc định (Preset Profile của một siêu kỹ sư công nghệ 27 tuổi tại Việt Nam) giúp trải nghiệm thử nghiệm diễn ra lập tức mà không bị nghẽn trang khởi động.

---

## 📁 Cấu Trúc Chi TIết Thư Mục (Project Structure)

```bash
├── .env.example                # Khung khai báo cấu hình môi trường
├── firebase-applet-config.json # File cấu hình kết nối Firebase Applet
├── firebase-blueprint.json    # Khung định hình dữ liệu Firestore
├── firestore.rules             # Luật bảo mật phân quyền dữ liệu người dùng
├── index.html                  # File HTML chính phục vụ khởi tạo Vite
├── metadata.json               # Siêu dữ liệu khai báo quyền và khả năng với AI Studio
├── package.json                # Quản lý script khởi chạy & khai báo gói phụ thuộc
├── server.ts                   # Trực tiếp đảm nhận xử lý API full-stack và nạp luồng tĩnh
├── tsconfig.json               # Cấu hình biên dịch TypeScript nghiêm ngặt
├── vite.config.ts              # Trung tâm định cấu hình Vite & Tailwind Compiler
├── src/
│   ├── main.tsx                # Điểm nạp mã nguồn chính của React Client
│   ├── App.tsx                 # Điều phối phân quyền Đăng nhập, Onboarding, định tuyến Tabs chính
│   ├── index.css               # Hệ thống khai báo font chữ (Google Fonts) và biến Tailwind @theme
│   ├── types.ts                # Khai báo định dạng kiểu dữ liệu dùng chung toàn hệ thống
│   ├── components/             # Thư mục chứa các Component chi tiết
│   │   ├── auth/               # Trình bao bọc màn hình đăng nhập (LoginScreen)
│   │   ├── charts/             # Bộ sưu tập các biểu đồ phân tích (Mounted Guarded)
│   │   │   ├── AllocationPieChart.tsx   # Biểu đồ tròn cơ cấu tài sản đề xuất
│   │   │   ├── DCAGrowthChart.tsx       # Đường cong tăng trưởng quỹ tích sản DCA
│   │   │   ├── NetWorthChart.tsx        # Biểu đồ cột chồng giá trị tài sản ròng
│   │   │   └── ScenarioCompareChart.tsx # So sánh trực quan các tình huống tỷ suất sinh lời
│   │   ├── forms/              # Trình tương tác biểu mẫu Onboarding 3 bước thông minh
│   │   │   ├── OnboardingStep1.tsx      # Bước 1: Khai báo dữ liệu Tài chính cơ sở
│   │   │   ├── OnboardingStep2.tsx      # Bước 2: Tầm soát và Khai báo rủi ro, dự định dài hạn
│   │   │   └── OnboardingStep3.tsx      # Bước 3: Đánh giá Năng lực chuyên môn & Kỹ năng cốt lõi
│   │   ├── layout/             # Định cấu hình khung thanh điều hướng
│   │   │   ├── Sidebar.tsx              # Thanh bên trái thanh lịch (Hỗ trợ chuyển các Tab đa nhiệm)
│   │   │   └── TopNav.tsx               # Thanh bên trên thể hiện trạng thái Firebase, Token Webhook
│   │   └── shared/             # Các thành phần tái sử dụng nâng cao
│   │       └── BackgroundUniverse.tsx   # Phông nền vũ trụ động sinh động bằng HTML Canvas
│   ├── contexts/               # Bộ quản lý toàn cục State
│   │   ├── AuthContext.tsx              # Theo dõi phiên đăng nhập của người dùng
│   │   └── UIContext.tsx                # Chia sẻ trạng thái lướt mượt mà giữa các vùng giao diện
│   ├── hooks/                  # Các xử lý logic nghiệp vụ tách biệt
│   │   └── useProfile.ts                # Trái tim điều phối đồng bộ lưu trữ Local-first vs Firebase
│   └── lib/                    # Lớp thư viện hỗ trợ truyền thông dữ liệu
│       ├── firebase.ts                  # Khởi tạo Firestore/Auth và giám sát kết nối thực tế
│       ├── openai/                      # Cổng định hướng bộ chuyển đổi Gemini Client
│       │   ├── client.ts                # Quản lý khởi tạo lười (Lazy initialization) của Gemini SDK
│       │   └── prompts.ts               # Bộ óc prompts tinh hoa định hình phân tích tài chính sâu sắc
│       ├── supabase/                    # Chứa định nghĩa interfaces đồng nhất với mã nguồn cũ
│       └── utils/                       # Bộ biến đổi chuỗi, định dạng phân cách mệnh giá VND
└── public/                     # Chứa các tài nguyên hình ảnh tĩnh và icon thương hiệu
```

---

## 🚀 Hoạt Động Cốt Lõi Của Ứng Dụng (Page Operations)

1.  **Dashboard**: Trung tâm quan sát nhanh. Cung cấp ước tính Tài Sản Ròng, Lượng Thặng Dư Hàng Tháng, phân loại rủi ro hiện tại và đưa ra cảnh báo hệ thống nhanh. Cho phép gửi Check-in đánh giá tài chính định kỳ theo tháng để nhận phân tích chi tiết của AI.
2.  **Ledger (Sổ Thu Chi Hoàn Chỉnh)**:
    *   Hỗ trợ ghi ghép thủ công trực diện với bộ phân loại trực quan (Thu nhập, Chi tiêu, Đầu tư tích sản).
    *   **Automated Webhook Sync**: Cho phép người dùng lấy mã token riêng biệt tại trang Settings. Khi nạp token vào dịch vụ của Telegram Bot hoặc n8n, bất kỳ tin nhắn tin báo biến động số dư ngân hàng qua SMS hoặc giao dịch thủ công trên phím tắt Telegram sẽ tự động gửi thẳng về Ledger mà không làm xáo trộn quy trình làm việc. Bạn chỉ cần ấn một nút ở Ledger để phê duyệt giao dịch tự động nạp.
3.  **Advisor (Cố Vấn Tài Sản)**: Nhận hồ sơ đầu vào của bạn tại Onboarding (được điều chỉnh linh hoạt trong trang Settings), gửi đến AI thông minh để nhận sơ đồ cơ cấu tài sản chi tiết (Quỹ dự phòng, Chứng chỉ quỹ ETF, Tiền mặt cơ hội, Vốn Side-Hustle, Phát triển Bản thân).
4.  **Simulator & Scenarios (Mô Phỏng Tích Sản)**:
    *   Cho phép tính toán kế hoạch tích lũy dài hạn kết hợp lãi kép định kỳ (DCA).
    *   So sánh trực quan cơ hội lợi nhuận giữa các phương pháp: Chỉ giữ toàn bộ tiền mặt gửi ngân hàng truyền thống (`4% / năm`) vs. Danh mục phân bổ tài sản FinCopilot hỗn hợp (`9% / năm`) vs. Tích lũy tối đa cổ phần quỹ chỉ số ETF (`12% / năm`).
5.  **Side Hustle (Kinh Doanh Phụ)**: Trực tiếp phân tích 3 tham số: Kỹ năng công nghệ hiện có của bạn + Quỹ thời gian rảnh mỗi tháng + Lĩnh vực công việc chính. AI sẽ tự động thiết lập và phác họa 5 lộ trình kinh doanh nhỏ từng bước cụ thể, ước tính khoảng cách tới dòng tiền đầu tiên và những công cụ hỗ trợ cần tập luyện.

---

## 🛠️ Hướng Dẫn Sử Dụng & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc
Nạp toàn bộ hệ sinh thái thư viện bổ trợ chỉ với một lệnh duy nhất:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Local Development)
Hệ thống sử dụng bộ chuyển mã TypeScript thời gian thực giúp khởi chạy cả Express Server song song với Vite Dev Server trên cổng duy nhất `3000`:
```bash
npm run dev
```

### 3. Biên dịch Production
Cấu trúc lệnh kép tự động gom thư viện React đầu tiên, sau đó gọi `esbuild` để dính liền toàn bộ các thành phần TypeScript API của máy chủ thành đầu ra CJS thống nhất:
```bash
npm run build
```

### 4. Khởi động sản phẩm biên dịch
Chạy trực tiếp máy chủ trung tâm để phân phối các luồng tĩnh cho khách hàng và liên thông API:
```bash
npm run start
```

---

## 🔒 Quy chuẩn Tác vụ An toàn Môi trường

*   **API Keys**: Tuyệt đối không khai báo cứng API Key của Google Gemini (`GEMINI_API_KEY`) trên Client Web. Mọi tác vụ được chuyển tiếp thông minh thông qua các API endpoints trung gian đặt tại máy chủ Express backend để che giấu mã xác minh, thực hiện lazy-load và bọc bảo vệ hiệu quả phòng tránh tấn công đánh cắp phiên.

---

*FinCopilot được chế tác để trở thành đòn bẩy tài chính bền vững nhất của bạn. Chúc bạn tích sản kiên trì và gặt hái độc lập tài chính sớm!* 🌌
