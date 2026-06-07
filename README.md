# 🌌 FinCopilot — Full-Stack AI Financial Companion for Vietnamese Young Professionals

<div align="center">

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-flat&color=3b82f6)](https://opensource.org/licenses/Apache-2.0)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D_18.0.0-emerald?style=flat-flat&color=10b981)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=flat-flat&color=8b5cf6)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.0-sky?style=flat-flat&color=0ea5e9)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-teal?style=flat-flat&color=0d9488)](https://tailwindcss.com/)

**The highly optimized wealth-allocation advisor, dynamic savings DCA simulator, and AI Side-Hustle planner customized for Vietnam's modern workforce.**

---

[🇺🇸 English Documentation](#english-version) • [🇻🇳 Tài liệu Tiếng Việt](#vietnamese-version)

</div>

---

<a id="english-version"></a><a id="-english-version"></a>
## 🇺🇸 English Version

### What is it?
**FinCopilot** is a modular, high-performance personal finance platform built with TypeScript, React 19, and Express. It is specifically targeted at young professionals, developers, and gig-workers in Vietnam to help them bridge the gap between active earnings, emergency safety buffers, long-term wealth compounding (DCA), and secondary digital revenue streams.

FinCopilot has a built-in transaction ledger connected via secure private token webhooks (leveraging Telegram logs, n8n automation, or curl) and features monthly AI finance check-ins. On top of that, it boasts an automated **Multi-Provider AI Engine** supporting Google Gemini, OpenAI, and Anthropic.

---

### Why should I use it?
*   **Hyper-Localized for Vietnam**: Out-of-the-box support for Vietnamese Dong (`₫` / `VND`) formatting, Vietnamese savings rates, tax bands, and native investment channels (VN30 ETFs, Gold, Deposits, and local tech freelancing).
*   **Provider-Agnostic LLM Routing**: Bring your own keys. By detecting key prefixes dynamically, the system routes requests to **Google Gemini** (`gemini-3.5-flash`), **OpenAI** (`gpt-4o-mini`), or **Anthropic** (`claude-3-5-haiku`) on-the-fly.
*   **Security-First Backend Architecture**: All third-party secrets and GenAI calls reside strictly behind a secure Express Proxy backend. No credentials are ever exposed to client web panels.
*   **Zero-friction Remote Webhooks**: Bind your unique secret webhook token to capture automated SMS bank balance changes or automated spending notifications from Telegram bots.
*   **Smart Internal Heuristics**: Facing network drops or rate limits? The local deterministic fallback rules-engine calculates robust capital allocations based on risk appetites without breaking a sweat.
*   **Immersive Cyber-Midnight Theme**: Clean responsive layout decorated with micro-animations (`motion`) and interactive cosmic starry canvases, pairing clean Inter with monospace JetBrains Mono display typography.

---

### System Architecture Blueprint

```text
                                  ┌───────────────────────────┐
                                  │   Third-Party Consumers   │
                                  │  (Telegram Bot, n8n, etc) │
                                  └─────────────┬─────────────┘
                                                │ Secure HTTP POST
                                                ▼ (with custom token)
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVER-SIDE BACKEND ROUTING                        │
│                                                                             │
│               ┌──────────────────────────────────────────────┐              │
│               │             /api/webhook/transaction          │              │
│               └──────────────────────┬───────────────────────┘              │
│                                      │ Accepts Ledger Transactions          │
│                                      ▼                                      │
│               ┌──────────────────────────────────────────────┐              │
│               │          Multi-Provider LLM Gateway          │              │
│               │            /api/ai/allocate-assets           │              │
│               │            /api/ai/side-hustles              │              │
│               │            /api/ai/generate-review           │              │
│               └──────────────────────┬───────────────────────┘              │
│                                      │                                      │
│               ▼                      ▼                      ▼               │
│   ┌─────────────────────┐   ┌─────────────────┐   ┌─────────────────────┐   │
│   │  Google GenAI SDK  │   │  OpenAI API Client│  │ Anthropic API Client│   │
│   │  (gemini-3.5-flash) │   │  (gpt-4o-mini)  │   │ (claude-3-5-haiku)  │   │
│   └─────────────────────┘   └─────────────────┘   └─────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Compiles Structured Data
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT CLIENT APP (SPA)                          │
│                                                                             │
│   ┌────────────────────┐     ┌────────────────────┐     ┌────────────────┐  │
│   │  DASHBOARD METRICS │     │  LEDGER WORKSPACE  │     │ DCA SIMULATOR  │  │
│   └────────────────────┘     └────────────────────┘     └────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│                       ┌──────────────────────────────┐                      │
│                       │    Integrated Data Coherence │                      │
│                       │ (Firestore / Local Fallback) │                      │
│                       └──────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Folder Blueprint

The following tree outlines the clean modularity of the codebase, ensuring minimal file sizes to optimize maintenance:

```text
├── .env.example                  # Environment configuration blueprint
├── firebase-applet-config.json   # Generated Firebase credentials
├── firebase-blueprint.json       # Document schemas for Firestore
├── firestore.rules               # Strict document-level security rules
├── index.html                    # SPA portal entry point
├── metadata.json                 # Core system applet declarations
├── package.json                  # Workspace dependencies & execution scripts
├── server.ts                     # Full-stack API Gateway Router & Dev server middleware
├── tsconfig.json                 # TypeScript strict compiler parameters
├── vite.config.ts                # Vite modules and Tailwind compilation parameters
├── public/                       # Statics, brand logos, fallback assets
└── src/                          # System Client App Space
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Master router & User Auth State coordinator
    ├── index.css                 # Main CSS injection featuring Tailwind @theme imports
    ├── types.ts                  # Shared typings and strictly typed interfaces
    ├── components/               # High-fidelity reusable modules
    │   ├── auth/                 # User authentication layout forms (LoginScreen)
    │   ├── charts/               # Wrapped charts protecting canvas resize lifecycle
    │   │   ├── AllocationPieChart.tsx   # Asset structure target split representation
    │   │   ├── DCAGrowthChart.tsx       # Compound compounding visualizer curves
    │   │   ├── NetWorthChart.tsx        # Compound asset stack bars
    │   │   └── ScenarioCompareChart.tsx # Core macro scenarios delta lines
    │   ├── forms/                # Multi-stage Onboarding questions
    │   │   ├── OnboardingStep1.tsx      # Base finances, reserves & incomes
    │   │   ├── OnboardingStep2.tsx      # Risk matrices & timelines
    │   │   └── OnboardingStep3.tsx      # Skills catalogs & profiles
    │   ├── layout/               # Structure shells
    │   │   ├── Sidebar.tsx              # Elegantly responsive control rail
    │   │   └── TopNav.tsx               # Header reflecting Webhook parameters & Auth metrics
    │   └── shared/               # Interactive UI visuals
    │       └── BackgroundUniverse.tsx   # Canvas cosmic interactive particle starfield
    ├── contexts/                 # Global state pools
    │   ├── AuthContext.tsx       # Manages user accounts and Firebase identities
    │   └── UIContext.tsx         # Coordinates tab states & cross-module locales (EN/VI)
    ├── hooks/                    # Reusable logic integrations
    │   └── useProfile.ts         # Coordinates local state seamlessly with Firestore sync
    └── pages/                    # Main tab pages in the workspace
        ├── Dashboard.tsx         # Health assessment reports & periodic AI evaluations
        ├── Onboarding.tsx        # Guided user financial mapping configuration
        ├── Advisor.tsx           # Generative portfolio structures with Target vs. Actuals
        ├── Ledger.tsx            # Transaction registry with webhook ingestion reviews
        ├── Simulator.tsx         # Interactive compound investment simulator
        ├── Scenarios.tsx         # Macro-economic scenario stress tests
        ├── SideHustle.tsx        # Skills-to-income generative advisor
        └── Settings.tsx          # Key settings, token parameters & database administration
```

---

### Installation

Make sure your server environment possesses [Node.js (v18+)](https://nodejs.org/).

```bash
# 1. Access the workspace directory
cd fincopilot

# 2. Deploy required third-party frameworks
npm install
```

---

### Quick Start

Get your local environment working in under 30 seconds using these quick terminal instructions:

```bash
# 1. Duplicate standard parameters
cp .env.example .env

# 2. Boot the integrated development compiler instantly!
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) on your local machine.

---

### Multi-Provider AI Routing

FinCopilot automatically inspects the API key structure passed either from settings or `.env` and intelligently pipes requests down the correct AI client pathways:

| Provided Key Format | Detected Engine | Targeted Model | Mode |
|:---|:---|:---|:---|
| Starts with `sk-ant-` | **Anthropic Claude** | `claude-3-5-haiku-20241022` | Server-Side API |
| Starts with `sk-` (and not ant) | **OpenAI GP** | `gpt-4o-mini` | Server-Side API |
| Oth---

<a id="vietnamese-version"></a><a id="-ban-tieng-viet"></a>
## 🇻🇳 Bản Tiếng Việt

### Nó là gì?
**FinCopilot** là một nền tảng quản lý tài chính cá nhân full-stack kết hợp API đa trung tâm được thiết kế đặc biệt dành riêng cho thế hệ chuyên gia trẻ, lập trình viên và người tự kinh doanh tự do (Gig-Workers) tại Việt Nam. 

Hệ thống điều hướng người dùng định hình mục tiêu thặng dư, cơ cấu quỹ khẩn cấp tối ưu, mô phỏng sinh lời dài hạn (hành trình Tích sản DCA / Lãi kép), lập kịch bản kinh tế vĩ mô, tự động đề xuất phân bổ dòng tiền và phác thảo 5 mô hình kinh doanh nhỏ (Side Hustle) đột phá dựa trên năng lực sẵn có thông qua Generative AI.

FinCopilot tích hợp **Sổ Cái Ledger** thông minh hỗ trợ đồng bộ dữ liệu thu chi tự động theo thời gian thực từ Telegram Bot hoặc luồng tự động hóa n8n bằng cổng API nhận diện bảo mật độc bản.

---

### Tại sao tôi nên sử dụng nó?
*   **Bản địa hóa sâu tại Việt Nam**: Hỗ trợ đầy đủ tiếng Việt, xử lý định dạng tiền tệ Việt Nam Đồng (`₫` / `VND`), đề xuất lãi suất nội địa và phân tách các kênh đầu tư truyền thống (Chứng chỉ quỹ ETF VN30, Vàng tiết kiệm, Tiết kiệm ngân hàng, Dự trữ linh hoạt).
*   **Trí tuệ nhân tạo đa lõi (Multi-LLM)**: Cho phép nạp linh hoạt và tự động phân luồng cuộc gọi API tới **Google Gemini** (`gemini-3.5-flash`), **OpenAI** (`gpt-4o-mini`), hoặc **Anthropic** (`claude-3-5-haiku`) tức thì tùy thuộc vào định dạng Key của bạn.
*   **Bảo vệ Key an toàn tuyệt đối**: Mọi hành trình liên kết và gọi dữ liệu của API đều diễn ra bí mật đằng sau proxy máy chủ Express. Tuyệt đối không để rò rỉ mã khóa ra tệp mã tĩnh chạy ở client.
*   **Liên thông Webhook nhàn nhã**: Lấy nhanh mã Token Webhook bảo mật tại tab Settings và thiết lập đồng bộ tin nhắn biến động số dư hoặc ghi chép nhanh từ Telegram đẩy thẳng về hệ thống Ledger.
*   **Hạ tầng cứu hộ Heuristic**: Dù hệ thống không có khóa API hay mất mạng, thuật toán tài chính cục bộ Heuristic tích hợp sẵn vẫn khởi động trơn tru, giúp xuất bản biểu đồ đề thiết lập tỉ lệ tài sản tối ưu.
*   **Hơi thở Không Gian Huyền Bí (Cosmic Theme)**: Không gian làm việc tối hiện đại với hiệu ứng bụi sao ngân hà lấp lánh sinh động, phối hợp kiểu chữ display **Inter** và số liệu tính toán **JetBrains Mono** sắc nét.

---

### Sơ đồ kiến trúc luồng vận hành

```text
                                   ┌───────────────────────────┐
                                   │   Dịch vụ đẩy ngoài       │
                                   │  (Telegram Bot, n8n, etc) │
                                   └─────────────┬─────────────┘
                                                 │ Gửi dữ liệu an toàn
                                                 ▼ (Kèm Token Webhook riêng)
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TRAO ĐỔI VÀ ĐIỀU PHỐI TỪ SERVER-SIDE                  │
│                                                                             │
│               ┌──────────────────────────────────────────────┐              │
│               │             /api/webhook/transaction          │              │
│               └──────────────────────┬───────────────────────┘              │
│                                      │ Chuyển giao dịch vào danh sách chờ   │
│                                      ▼                                      │
│               ┌──────────────────────────────────────────────┐              │
│               │         Hạ tầng nhận dạng AI đa lõi          │              │
│               │            /api/ai/allocate-assets           │              │
│               │            /api/ai/side-hustles              │              │
│               │            /api/ai/generate-review           │              │
│               └──────────────────────┬───────────────────────┘              │
│                                      │                                      │
│               ▼                      ▼                      ▼               │
│   ┌─────────────────────┐   ┌─────────────────┐   ┌─────────────────────┐   │
│   │  Google GenAI SDK  │   │  API Client OpenAI│  │ API Client Anthropic│   │
│   │  (gemini-3.5-flash) │   │  (gpt-4o-mini)  │   │ (claude-3-5-haiku)  │   │
│   └─────────────────────┘   └─────────────────┘   └─────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Xuất bản cấu trúc JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ỨNG DỤNG KHÁCH REACT (SPA)                         │
│                                                                             │
│   ┌────────────────────┐     ┌────────────────────┐     ┌────────────────┐  │
│   │   BẢNG ĐIỀU KHIỂN  │     │ SỔ LEDGER TỰ ĐỘNG  │     │ BIỂU ĐỒ DCA    │  │
│   │ (DASHBOARD METRICS)│     │ (LEDGER WORKSPACE) │     │ (DCA/LÃI KÉP)  │  │
│   └────────────────────┘     └────────────────────┘     └────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│                       ┌──────────────────────────────┐                      │
│                       │   Mạch dữ liệu đồng bộ thực  │                      │
│                       │ (Firestore / Local Fallback) │                      │
│                       └──────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Sơ đồ chi tiết cấu trúc thư mục

Cơ cấu thư mục được tổ chức tách biệt rõ ràng để tránh xung đột dung lượng tệp tin và nạp biên dịch nhanh chóng hơn:

```text
├── .env.example                  # File cấu hình tham số môi trường mẫu
├── firebase-applet-config.json   # Thông tin cấu hình ứng dụng Firebase đã tạo
├── firebase-blueprint.json       # Định dạng cơ sở tài liệu Firestore Blueprint
├── firestore.rules               # Quy luật phân quyền bảo vệ văn bản Firestore nghiêm ngặt
├── index.html                    # Cổng mồi khởi chạy SPA chính
├── metadata.json                 # Định nghĩa các quyền và các mô tả tính năng lõi hệ thống
├── package.json                  # Quản lý các thư viện phụ thuộc & Script khởi chạy ứng dụng
├── server.ts                     # Máy chủ Express API Gateway & Điều phối tài nguyên nạp Vite
├── tsconfig.json                 # Thiết lập thông số trình biên dịch TypeScript
├── vite.config.ts                # Tham số cấu hình Vite và tích hợp Tailwind CSS
├── public/                       # Quản lý tài nguyên tĩnh, Logo và tệp Service Worker
└── src/                          # Không gian làm việc của Client React APP
    ├── main.tsx                  # Điểm khởi đầu khởi chạy React
    ├── App.tsx                   # Điều hướng chính & Đồng bộ tài khoản người dùng
    ├── index.css                 # File kiểu dáng chứa các khai báo chủ đề Tailwind v4
    ├── types.ts                  # Định nghĩa tập trung các interfaces tĩnh, kiểu dữ liệu ứng dụng
    ├── components/               # Các khối thành phần tái sử dụng độ hoàn thiện cao
    │   ├── auth/                 # Form đăng nhập, đăng ký và giới thiệu (LoginScreen)
    │   ├── charts/               # Các biểu đồ bao đóng phòng chống nứt vỡ khung giao diện
    │   │   ├── AllocationPieChart.tsx   # Cơ cấu tỷ lệ danh mục tài sản lý tưởng vs thực tế
    │   │   ├── DCAGrowthChart.tsx       # Đường cong dự phóng tích sản dồn tiền lãi kép
    │   │   ├── NetWorthChart.tsx        # Cột chồng tổng giá trị danh mục ròng tích lũy
    │   │   └── ScenarioCompareChart.tsx # So sánh biến đổi các kịch bản kinh tế vĩ mô
    │   ├── forms/                # Biểu mẫu đăng ký hồ sơ Onboarding đa lớp
    │   │   ├── OnboardingStep1.tsx      # Bước 1: Tài sản hiện trạng, nợ nần & dòng thặng dư
    │   │   ├── OnboardingStep2.tsx      # Bước 2: Khảo sát đo lường rủi ro & mốc tự do tài chính
    │   │   └── OnboardingStep3.tsx      # Bước 3: Danh mục thế mạnh và định danh nghề nghiệp
    │   ├── layout/               # Bộ khung điều khiển chính
    │   │   ├── Sidebar.tsx              # Thanh chuyển tab thu gọn tối ưu chiều ngang
    │   │   └── TopNav.tsx               # Header hiển thị Token Webhook & Đồng bộ tài khoản
    │   └── shared/               # Hiệu ứng trang trí đồ họa
    │       └── BackgroundUniverse.tsx   # Canvas tạo lập hạt bụi không gian hạt sao tương tác
    ├── contexts/                 # Vùng lưu trữ trạng thái liên kết toàn cục
    │   ├── AuthContext.tsx       # Đồng bộ định danh tài khoản và Firebase Core
    │   └── UIContext.tsx         # Đồng bộ biến số Ngôn ngữ (VI/EN) và Theme giao diện
    ├── hooks/                    # Các trình xử lý logic nghiệp vụ trích xuất
    │   └── useProfile.ts         # Quản trị đồng bộ thông suốt cấu hình giữa Local và Firestore
    └── pages/                    # Các trang hiển thị chính tương ứng các Tab nghiệp vụ
        ├── Dashboard.tsx         # Báo cáo sức khỏe ví tiền & Gửi nhận xét từ AI hàng tháng
        ├── Onboarding.tsx        # Khảo sát nạp dữ liệu tài chính ban đầu cho tài khoản mới
        ├── Advisor.tsx           # Trực quan hóa danh mục khuyến nghị và phân bổ tài sản mục tiêu
        ├── Ledger.tsx            # Nhật ký thu chi và duyệt biến động số dư từ Webhook ngoài
        ├── Simulator.tsx         # Máy tính lập kế hoạch tích lũy dồn vốn DCA tuyến tính
        ├── Scenarios.tsx         # Trình giả lập chạy các kịch bản suy thoái/hưng thịnh kinh tế
        ├── SideHustle.tsx        # Trợ lý đề xuất lộ trình khởi nghiệp phụ từ kĩ năng chuyên nghiệp
        └── Settings.tsx          # Quản lý khóa API, đồng bộ token liên kết và cấu trúc dữ liệu
```

---

### Hướng dẫn cài đặt

Hãy đảm bảo thiết bị máy chủ hoặc máy phát triển đã nạp [Node.js (Bản 18 trở lên)](https://nodejs.org/).

```bash
# 1. Truy cập vào thư mục mã nguồn FinCopilot
cd fincopilot

# 2. Cài đặt toàn bộ bộ thư viện phụ thuộc của hệ thống
npm install
```

---

### Khởi động nhanh (Copy-paste chạy được ngay)

Để đưa sản phẩm hoạt động mượt mà đầy đủ mọi tiến trình trong chưa đầy 30 giây:

```bash
# 1. Sao chép và tạo lập tệp cấu hình tham số môi trường
cp .env.example .env

# 2. Khởi chạy dự án tích hợp ngay tức thì!
npm run dev
```

Mở trình duyệt tại liên kết: [http://localhost:3000](http://localhost:3000) để trải nghiệm.

---

### Cơ chế tự động nhận diện AI

FinCopilot tự phân rã cấu trúc tệp API keys được dán vào biểu mẫu Cài đặt hoặc khai báo trong `.env` để định hướng tiến trình nạp mô hình:

| Định dạng API Key | Nhận diện Engine | Mô hình mục tiêu | Cơ chế kết nối |
|:---|:---|:---|:---|
| Bắt đầu bằng `sk-ant-` | **Anthropic Claude** | `claude-3-5-haiku-20241022` | API Express máy chủ (Server-Side) |
| Bắt đầu bằng `sk-` | **OpenAI GPT** | `gpt-4o-mini` | API Express máy chủ (Server-Side) |
| Định dạng khác / Mặc định | **Google Gemini** | `gemini-3.5-flash` | SDK Google GenAI máy chủ chính thức (Server-Side) |

---

### Hướng dẫn sử dụng REST API Webhook

Máy chủ Express liên tục lắng nghe biến động giao dịch từ các bot/script ở bên ngoài.

#### 🕹️ Đẩy giao dịch về hàng đợi Sổ Ledger
*   **Địa chỉ cổng**: `POST /api/webhook/transaction`
*   **Bảo mật truy cập**: Truyền param `token` trên URL (Ví dụ: `?token=XYZ`) hoặc đính kèm Header `X-Webhook-Token: <Token_Settings>`.
*   **Định dạng yêu cầu** (`application/json`):
```json
{
  "type": "expense",
  "amount_vnd": 65000,
  "category": "Ăn uống",
  "description": "Cà phê buổi sáng ghi nhận từ Telegram Bot"
}
```
*   **Quy ước các trường**:
    *   `type`: Bắt buộc phải là `'income'` (Thu nhập) | `'expense'` (Chi tiêu) | `'investment'` (Đầu tư tích sản).
    *   `amount_vnd`: Số nguyên dương dạng số lượng (lớn hơn 0).
    *   `category`: Tên nhãn phân nhóm giao dịch (Không bắt buộc).
    *   `description`: Mô tả chi tiết phục vụ cho tiến trình AI đánh giá tháng sau.

---

### Cấu hình biến môi trường tại tệp `.env`

Đóng góp và khai báo các khóa bí mật của bạn tại tệp tin `.env` ở thư mục gốc:

```env
# Cấu hình AI mẫu chuẩn Google Gemini (Mặc định)
GEMINI_API_KEY=AIzaSy...

# Cấu hình OpenAI (Tự khởi động nếu key bộc lộ dạng 'sk-')
OPENAI_API_KEY=sk-proj-...

# Cấu hình Anthropic Claude (Tự khởi động nếu key bộc lộ dạng 'sk-ant-')
ANTHROPIC_API_KEY=sk-ant-pix...
```

---

### Các lệnh thao tác trong phát triển

```bash
# Khởi động không gian Dev (Tích hợp song hành Express Server và Vite Assets Proxy trên cổng 3000)
npm run dev

# Đóng gói và biên dịch trọn vẹn dự án dưới tệp đơn nhất /dist/server.cjs bằng esbuild
npm run build

# Khởi chạy bản đóng gói chính thức trên môi trường Production
npm run start

# Kiểm soát rà soát lỗi cú pháp nghiêm ngặt toàn bộ tệp tin
npm run lint
```

---

### Hướng dẫn cách thức đóng góp
Chúng tôi hoan nghênh những ý tưởng đóng góp nâng cấp cốt lõi từ cộng đồng:
1. Tạo một nhánh rẽ (Fork) từ kho lưu trữ.
2. Thiết kế linh kiện tập trung tại thư mục `/src/components/`, tuyệt đối không viết bừa bãi làm phình tệp `App.tsx`.
3. Kiềm chế sử dụng styles dạng inline, ưu ái sử dụng các quy chuẩn lớp tiện ích Tailwind CSS v4.0.
4. Chạy kiểm tra kỹ thuật đạt mức độ biên dịch an toàn tuyệt đối qua `npm run lint` & `npm run build`.
5. Tạo pull request mô tả rõ rệt các cải tiến công nghệ hữu hiệu.

---

### Giấy phép và Bản quyền

Sản phẩm được phân phối chính thức theo Giấy phép [Apache-2.0 open-source license](LICENSE). Toàn bộ khai báo bản quyền được ghi nhận trang nghiêm ở đầu các tệp tin nghiệp vụ lõi và tệp máy chủ `/server.ts`.
� số rủi ro & Mục tiêu tự do
    │   │   └── OnboardingStep3.tsx      # Bước 3: Độc bản kỹ năng nghề nghiệp chuyên môn
    │   ├── layout/               # Thiết kế kết cấu giao diện ngoài
    │   │   ├── Sidebar.tsx              # Thanh tay vịn chuyển tab mượt mà bên trái
    │   │   └── TopNav.tsx               # Thanh đầu trang điều khiển Token và trạng thái Auth
    │   └── shared/               # Thành phần trang trí cao cấp
    │       └── BackgroundUniverse.tsx   # Nền hạt vũ trụ tĩnh tương tác Canvas sống động
    ├── contexts/                 # Vùng lưu trữ trạng thái chia sẻ liên thông
    │   ├── AuthContext.tsx       # Quản trị thông tin xác thực và trạng thái Firebase Auth
    │   └── UIContext.tsx         # Theo dõi biến số Ngôn ngữ (VI/EN) và chuyển tab hiển thị
    ├── hooks/                    # Trích xuất xử lý logic nghiệp vụ
    │   └── useProfile.ts         # Đồng bộ dữ liệu cấu hình thông minh giữa Local và Firestore
    └── pages/                    # Các trang Tab nghiệp vụ chủ đạo
        ├── Dashboard.tsx         # Kiểm tra sức khỏe ví tiền & Gửi nhận xét AI hàng tháng
        ├── Onboarding.tsx        # Thiết kế khảo sát nạp số liệu tài chính cơ sở ban đầu
        ├── Advisor.tsx           # Trực quan biểu đồ danh mục đề xuất thực tế vs mục tiêu kì vọng
        ├── Ledger.tsx            # Nhật ký thu chi đa loại hình và cổng duyệt Webhook
        ├── Simulator.tsx         # Máy tính dồn tiền DCA lãi kép tuyến tính
        ├── Scenarios.tsx         # Chạy biến số suy thoái / hưng thịnh thị trường kinh tế
        ├── SideHustle.tsx        # Tư vấn phân rã các lộ trình làm nghề rảnh tay tăng thu nhập
        └── Settings.tsx          # Tùy chọn thiết bị cấu hình, cổng API Keys và dọn dẹp cơ sở dữ liệu
```

---

## Cài đặt

Hãy đảm bảo thiết bị máy chủ hoặc máy phát triển đã nạp [Node.js (Bản 18 trở lên)](https://nodejs.org/).

```bash
# 1. Truy cập vào thư mục mã nguồn FinCopilot
cd fincopilot

# 2. Cài đặt toàn bộ bộ thư viện phụ thuộc của hệ thống
npm install
```

---

## Khởi động nhanh (Copy-paste chạy được ngay)

Để đưa sản phẩm hoạt động mượt mà đầy đủ mọi tiến trình trong chưa đầy 30 giây:

```bash
# 1. Sao chép và tạo lập tệp cấu hình tham số môi trường
cp .env.example .env

# 2. Khởi chạy dự án tích hợp ngay tức thì!
npm run dev
```

Mở trình duyệt tại liên kết: [http://localhost:3000](http://localhost:3000) để trải nghiệm.

---

## Cơ Chế Nhận Diện AI Tự Động

FinCopilot tự phân rã cấu trúc tệp API keys được dán vào biểu mẫu Cài đặt hoặc khai báo trong `.env` để định hướng tiến trình nạp mô hình:

| Định dạng API Key | Nhận diện Engine | Mô hình mục tiêu | Cơ chế kết nối |
|:---|:---|:---|:---|
| Bắt đầu bằng `sk-ant-` | **Anthropic Claude** | `claude-3-5-haiku-20241022` | Server-Side Express API |
| Bắt đầu bằng `sk-` | **OpenAI GPT** | `gpt-4o-mini` | Server-Side Express API |
| Định dạng khác / Mặc định | **Google Gemini** | `gemini-3.5-flash` | Official Google GenAI SDK |

---

## Hướng Dẫn Sử Dụng REST API Webhook

Máy chủ Express liên tục lắng nghe biến động giao dịch từ các bot/script ở bên ngoài.

#### 🕹️ Đẩy giao dịch về hàng đợi Sổ Ledger
*   **Địa chỉ cổng**: `POST /api/webhook/transaction`
*   **Bảo mật truy cập**: Truyền param `token` trên URL (Ví dụ: `?token=XYZ`) hoặc đính kèm Header `X-Webhook-Token: <Token_Settings>`.
*   **Định dạng yêu cầu** (`application/json`):
```json
{
  "type": "expense",
  "amount_vnd": 65000,
  "category": "Ăn uống",
  "description": "Cà phê buổi sáng ghi nhận từ Telegram Bot"
}
```
*   **Quy ước các trường**:
    *   `type`: Bắt buộc phải là `'income'` (Thu nhập) | `'expense'` (Chi tiêu) | `'investment'` (Đầu tư tích sản).
    *   `amount_vnd`: Số nguyên dương dạng số lượng (lớn hơn 0).
    *   `category`: Tên nhãn phân nhóm giao dịch (Không bắt buộc).
    *   `description`: Mô tả chi tiết phục vụ cho tiến trình AI đánh giá tháng sau.

---

## Cấu hình Biến Môi trường `.env`

Đóng góp và khai báo các khóa bí mật của bạn tại tệp tin `.env` ở thư mục gốc:

```env
# Cấu hình AI mẫu chuẩn Google Gemini (Mặc định)
GEMINI_API_KEY=AIzaSy...

# Cấu hình OpenAI (Tự khởi động nếu key bộc lộ dạng 'sk-')
OPENAI_API_KEY=sk-proj-...

# Cấu hình Anthropic Claude (Tự khởi động nếu key bộc lộ dạng 'sk-ant-')
ANTHROPIC_API_KEY=sk-ant-pix...
```

---

## Các Lệnh Thao Tác Khi Phát Triển

```bash
# Khởi động không gian Dev (Tích hợp song hành Express Server và Vite Assets Proxy trên cổng 3000)
npm run dev

# Đóng gói và biên dịch trọn vẹn dự án dưới tệp đơn nhất /dist/server.cjs bằng esbuild
npm run build

# Khởi chạy bản đóng gói chính thức trên môi trường Production
npm run start

# Kiểm soát rà soát lỗi cú pháp nghiêm ngặt toàn bộ tệp tin
npm run lint
```

---

## Đóng góp đóng góp
Chúng tôi hoan nghênh những ý tưởng đóng góp nâng cấp cốt lõi từ cộng đồng:
1. Tạo một nhánh rẽ (Fork) từ kho lưu trữ.
2. Thiết kế linh kiện tập trung tại thư mục `/src/components/`, tuyệt đối không viết bừa bãi làm phình tệp `App.tsx`.
3. Kiềm chế sử dụng styles dạng inline, ưu ái sử dụng các quy chuẩn lớp tiện ích Tailwind CSS v4.0.
4. Chạy kiểm tra kỹ thuật đạt mức độ biên dịch an toàn tuyệt đối qua `npm run lint` & `npm run build`.
5. Tạo pull request mô tả rõ rệt các cải tiến công nghệ hữu hiệu.

---

## Bản quyền

Sản phẩm được phân phối chính thức theo Giấy phép [Apache-2.0 open-source license](LICENSE). Toàn bộ khai báo bản quyền được ghi nhận trang nghiêm ở đầu các tệp tin nghiệp vụ lõi và tệp máy chủ `/server.ts`.
