# 🌌 FinCopilot - AI Financial Co-pilot for Vietnamese Young Professionals
> **Smart Wealth Allocation, Long-term DCA Tích sản, and Side Hustle Generator guided by Gemini AI.**

---

*Scroll down or click here for the **[Vietnamese Version / Bản Tiếng Việt](#-fincopilot---trợ-lý-tài-chính-thông-minh-bằng-ai)**.*

---

## 🇺🇸 English Version

### What is it?
**FinCopilot** is a full-stack, personal wealth management application tailored for young professionals, developers, and creators in Vietnam. It guides users from core financial onboarding, emergency fund structuring, and long-term Dollar-Cost Averaging (DCA/Tích sản) simulation, to AI-driven wealth allocation advice and customized "Side Hustle" business ideas. 

FinCopilot has a built-in transaction logging engine (Ledger) that accepts real-time automated webhook notifications (e.g., SMS alerts forwarded by Telegram Bot or n8n automated integration workflow) and supports intelligent periodic financial evaluations directly using Gemini-3.5-Flash.

---

### Why should I use it?
1. **Designed for Vietnam**: Handles Native Vietnamese currency (`₫` / `VND`) formatting, native bank rates, and typical asset classes (such as gold, high-yield bank deposits, VN30 index ETFs, and real estate).
2. **Server-Side API security**: Keeps your Google Gemini API tokens completely hidden from the browser frontend using an Express proxy.
3. **Automated Transactions (Zero Manual Hassle)**: Generate a unique webhook token to automatically pipe income or expenses into your ledger using n8n or generic messaging bots.
4. **Heuristic Fallback System**: If you lack a Gemini API key or face server-side quota limits, a detailed local rule-set engine computes highly accurate allocations and recommendations tailored to your profile.
5. **Cosmic Midnight Theme**: Beautiful responsive workspace featuring dynamic canvas stars and premium typography (Inter & JetBrains Mono), eliminating unnecessary UI clutter.

---

### Installation

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed before proceeding.

```bash
# 1. Clone or visit your repository folder
cd fincopilot

# 2. Install all dependencies for both Express and React
npm install
```

---

### Quick Start (copy-paste and run instantly)

Copy and execute these commands in your console to run the application immediately:

```bash
# 1. Declare your mock/local environment config
cp .env.example .env

# 2. Boot the full-stack development environment instantly!
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000). The server runs the Express REST API and proxies assets through Vite automatically!

---

### API Usage

FinCopilot exposes backend endpoints on port `3000` to support remote webhook logging.

#### 1. POST `/api/webhook/transaction`
Send automatic bank balance alterations or custom transaction entries from remote agents (Telegam bots, n8n).

* **Headers**:
  * `Content-Type: application/json`
  * `X-Webhook-Token: <your_private_token>` (or pass via `?token=<your_private_token>` query param)

* **Request Body Payload**:
```json
{
  "type": "expense",
  "amount_vnd": 50000,
  "category": "Ăn uống",
  "description": "Bánh mì ăn sáng nhận từ Telegram"
}
```
* **Supported Categories & Types**:
  * `type`: `'income'` | `'expense'` | `'investment'`
  * `amount_vnd`: Positive integer
  * `category`: (Optional) Custom string

---

### Configuration

Declare your configurations in the `.env` file inside your workspace root:

```env
# Gemini API Key (Required for AI generation, kept server-side only)
GEMINI_API_KEY=your_google_gemini_api_key

# Database Connectivity (Optional)
# FinCopilot operates a local fallback engine seamlessly storing profiles
# in LocalStorage if Firebase credentials aren't deployed.
```

---

### Development

* **Dev Commands**: Runs `server.ts` directly on TypeScript execute environment (`tsx`) alongside local Vite middleware:
  ```bash
  npm run dev
  ```
* **Production Build**: Compiles web bundle and bundles the TypeScript backend server into a single CJS binary (`dist/server.cjs`) to escape pathing errors:
  ```bash
  npm run build
  ```
* **Production Run**:
  ```bash
  npm run start
  ```
* **Coding Standards**: Pre-configured with Tailwind v4 `@theme` settings. Avoid using raw inline styles or extra CSS modules. Run linter before committing:
  ```bash
  npm run lint
  ```

---

### Contributing
We welcome developer feedback and structural improvements!
1. Fork the codebase on your favorite Git provider.
2. Build modular sub-components in `/src/components/` and keep `/src/App.tsx` slim.
3. Test compatibility using `npm run lint` and `npm run build`.
4. Open a clear Pull Request.

---

### License
This project is licensed under the Apache-2.0 License. See the header declarations inside `/server.ts` or individual pages for full notice.

---
---

## 🇻🇳 Bản Tiếng Việt

## Nó là gì?
**FinCopilot** là một nền tảng quản lý tài chính cá nhân toàn diện (Full-Stack) được thiết kế đặc thù cho giới trẻ công nghệ, lập trình viên và những nhà sáng tạo nội dung số tại Việt Nam.

Hệ thống đưa bạn đi qua quy trình Onboarding xác mục tiêu tích lũy, tối ưu hóa quỹ an toàn tài chính cá nhân, mô phỏng sinh lời lãi kép qua DCA (Tích sản định kỳ), đồng thời đề xuất cơ cấu phân bổ dòng tiền và các đề án nghề tay trái (Side Hustle) bằng Trí tuệ Nhân tạo Gemini thông minh.

---

## Tại sao tôi nên sử dụng nó?
1. **Thiết kế Định vị Việt Nam**: Hỗ trợ bản địa hóa tiếng Việt - Anh trực quan, xử lý mệnh giá Đồng tiền (`₫` / `VND`), ước tính các kênh đầu tư quen thuộc như Tiết kiệm kì hạn, Chứng chỉ quỹ ETF VN30, Vàng và Bất động sản.
2. **Bảo mật Khoá API Tuyệt đối**: Khởi tạo lười (lazy-load) và thực thi cuộc gọi API Gemini-3.5-Flash tại Server-Side (Express backend), rũ bỏ rủi ro lộ khóa cá nhân trên trình duyệt client.
3. **Sổ cái Ledger webhook siêu cấp**: Đồng bộ luồng giao dịch nhàn nhã thông qua Cổng Webhook riêng tư. Dễ dàng chuyển dịch tin nhắn biến động số dư SMS từ Telegram Bot hoặc n8n thẳng tới sổ chờ duyệt.
4. **Mạng lưới cứu hộ Heuristic**: Nếu hệ thống chưa bật API Key hoặc gặp sự cố nghẽn mạng, thuật toán tài chính cục bộ Heuristic ưu việt sẽ tự động thế chỗ để đề xuất tỉ lệ vàng phân bổ tài sản chuẩn xác.
5. **Giao diện Không Gian Huyền Bí (Cosmic Theme)**: Không gian làm việc tối thư thái kết hợp hiệu ứng bụi ngân hà tương tác sinh động bằng Canvas, dùng font chữ chữ chuyên dụng Inter và JetBrains Mono trang nhã cho số liệu.

---

## Cài đặt

Yêu cầu máy tính cài đặt sẵn [Node.js (v18 trở lên)](https://nodejs.org/).

```bash
# 1. Truy cập thư mục chứa mã nguồn dự án
cd fincopilot

# 2. Cài đặt các thư viện phụ thuộc liên quan
npm install
```

---

## Quick Start (Copy-paste chạy được ngay)

Chạy các lệnh bên dưới để khởi động nhanh ứng dụng:

```bash
# 1. Tạo tệp cấu hình môi trường từ bản tham chiếu cấu trúc
cp .env.example .env

# 2. Khởi chạy dự án tích hợp ngay lập tức!
npm run dev
```

Tiếp theo, truy cập cổng trình duyệt nội bộ tại [http://localhost:3000](http://localhost:3000).

---

## Cách thức sử dụng API

Hệ thống sử dụng cổng backend REST API lắng nghe các thông tin từ cổng ngoài đổ về.

#### 1. Đăng ký giao dịch mới: POST `/api/webhook/transaction`
Truyền tín hiệu giao dịch thu chi phát sinh trực tiếp từ Telegram Bot hoặc luồng tự động n8n.

* **Headers**:
  * `Content-Type: application/json`
  * `X-Webhook-Token: <mã_token_cá_nhân_tại_settings>` (hoặc cung cấp dưới dạng tham số truy vấn `?token=<mã_token>`)

* **Nội dung yêu cầu (Body JSON)**:
```json
{
  "type": "expense",
  "amount_vnd": 50000,
  "category": "Ăn uống",
  "description": "Bánh mì ăn sáng chuyển từ Telegram"
}
```
* **Tham số hợp lệ**:
  * `type`: `'income'` (Thu nhập) | `'expense'` (Chi tiêu) | `'investment'` (Tích sản/Đầu tư)
  * `amount_vnd`: Số nguyên lớn hơn 0
  * `category`: Nhãn phân loại loại hình chi tiêu (Không bắt buộc)

---

## Cấu hình

Thiết lập các biến môi trường trực tiếp trong tệp tin `.env` ở gốc thư mục dự án:

```env
# Mã khóa trí tuệ nhân tạo (Bắt buộc để chạy các tính năng AI của Gemini)
GEMINI_API_KEY=mã_api_key_gemini_của_bạn

# Các cấu hình kết nối Firebase (Không bắt buộc)
# Hệ thống hỗ trợ lưu trữ cục bộ Local-First thông minh và tự động đồng bộ 
# sang đám mây Firestore khi bạn cập nhật tệp tin khởi tạo.
```

---

## Phát triển

* **Môi trường Dev**: Khởi động song hành Express Server và Vite Assets Proxy:
  ```bash
  npm run dev
  ```
* **Đóng gói phân phối (Build)**: Tế hợp toàn bộ mã đầu ra React kết hợp `esbuild` bọc máy chủ thành dạng đơn nhân `/dist/server.cjs` bảo đảm tốc độ khởi hành tối ưu:
  ```bash
  npm run build
  ```
* **Chạy Production**:
  ```bash
  npm run start
  ```
* **Tiêu chuẩn lập trình**: Mã nguồn sử dụng Tailwind CSS v4.0. Tránh sinh thêm tệp tin `.css` con ngoài luồng hoặc can thiệp bừa bãi vào hệ thống styles mặc định. Hãy tiến hành quét linter trước khi commit:
  ```bash
  npm run lint
  ```

---

## Đóng góp
Chúng tôi hoan nghênh mọi đóng góp của cộng đồng lập trình viên tài chính!
1. Tạo một nhánh rẽ (Fork) từ nhánh chính của kho lưu trữ.
2. Đóng góp tách biệt thông qua các files độc lập bên trong `/src/components/`, tránh dồn nén toàn bộ logic vào `App.tsx`.
3. Chạy kiểm tra kỹ thuật bằng: `npm run lint` và `npm run build` trước khi đề đạt tích hợp.
4. Gửi một yêu cầu Pull Request rõ ràng mô tả các đóng góp cải tiến của bạn.

---

## Bản quyền
Dự án được phân phối chính thức theo giấy phép mã nguồn mở Apache-2.0. Xem chi tiết thông số bảo hộ bản quyền khai báo ở đầu trang mã nguồn và tập tin `/server.ts`.
