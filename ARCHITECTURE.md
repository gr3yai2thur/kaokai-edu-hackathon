# KaoKai Education Platform — Architecture

## สารบัญ
- [ภาพรวม](#ภาพรวม)
- [Tech Stack](#tech-stack)
- [สถาปัตยกรรม](#สถาปัตยกรรม)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [Firestore Data Model](#firestore-data-model)

> การใช้งานและคำสั่ง deploy ดูได้ที่ [README.md](./README.md)

---

## ภาพรวม

**KaoKai Education Platform** (LearnHub) คือแพลตฟอร์มการเรียนออนไลน์ที่รองรับทั้ง **ผู้เรียน** และ **ผู้ดูแลระบบ (Admin)** มี features หลักได้แก่ การลงทะเบียนเรียนคอร์ส, ติดตาม progress, ระบบ points & rewards, leaderboard, AI chat assistant และการดาวน์โหลดใบประกาศนียบัตร PDF

---

## Tech Stack

| หมวด | เทคโนโลยี | เหตุผลที่เลือก |
|------|-----------|----------------|
| **Frontend Framework** | React 18 | Component-based, ecosystem กว้าง, hooks ทำให้จัดการ state ได้สะดวก |
| **Build Tool** | Vite | เร็วกว่า CRA มาก, HMR ใกล้เคียง instant, config เรียบง่าย |
| **Routing** | React Router v6 | standard สำหรับ React SPA, รองรับ nested routes และ protected routes ได้ดี |
| **Styling** | Tailwind CSS v3 | utility-first ทำให้เขียน UI เร็ว, ไม่ต้องตั้งชื่อ class เอง, bundle size เล็กเพราะ purge unused styles |
| **UI Components** | shadcn/ui + Radix UI | headless components ที่ accessible by default, ไม่ lock-in design system |
| **Database & Auth** | Firebase (Firestore + Auth) | realtime database, built-in auth (Google OAuth + Email), ไม่ต้องดูแล backend server เอง |
| **State Management** | React Context + hooks | ไม่ซับซ้อนพอที่จะต้องใช้ Redux, Context เพียงพอสำหรับ auth state |
| **Server State** | TanStack Query v5 | caching, background refetch, loading/error states สำหรับ async data |
| **Charts** | Recharts | integrate กับ React ได้ดี, API declarative, customizable |
| **Icons** | Lucide React | icon set ที่สม่ำเสมอ, tree-shakeable |
| **PDF Generation** | jsPDF + html2canvas | render HTML เป็น canvas แล้ว export เป็น PDF คุณภาพสูง |
| **AI Chat** | Google Gemini API (@google/genai) | ใช้ Gemini ตอบคำถามเกี่ยวกับคอร์สและการเรียน |
| **Animation** | Framer Motion | smooth transitions, ใช้กับ confetti/badge animations |
| **Confetti** | canvas-confetti | lightweight, ไม่ต้องพึ่ง library ใหญ่ |
| **Form Handling** | React Hook Form + Zod | performance ดี (uncontrolled), Zod validation แบบ type-safe |

---

## สถาปัตยกรรม

```
┌─────────────────────────────────────────────┐
│              Browser (React SPA)            │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Pages   │  │Components│  │  Hooks   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │        │
│  ┌────▼──────────────▼──────────────▼─────┐ │
│  │           AuthContext (Global State)    │ │
│  └────────────────────┬────────────────────┘ │
└───────────────────────┼─────────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │         Firebase               │
        │  ┌─────────────┐ ┌──────────┐  │
        │  │  Firestore  │ │   Auth   │  │
        │  │  (realtime) │ │(Google + │  │
        │  │             │ │  Email)  │  │
        │  └─────────────┘ └──────────┘  │
        └────────────────────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │       Google Gemini API        │
        │       (AI Chat Assistant)      │
        └────────────────────────────────┘
```

### Data Flow
1. User เปิดแอป → `onAuthStateChanged` ใน AuthContext ดึงข้อมูล profile จาก Firestore
2. Component ใช้ **custom hooks** (`useEnrollment`, `useCourses`, `useAllEnrollments`) ดึง data จาก Firestore แบบ real-time
3. Static seed data (50 คอร์ส, users, enrollments) อยู่ใน `src/data/*.json` — Firestore data จะ override ถ้า `course_id` ซ้ำกัน (merge pattern)
4. การเขียน data ทั้งหมดผ่าน hooks โดยตรง ไม่มี backend API layer

---

## โครงสร้างโปรเจกต์

```
src/
├── main.jsx              # Entry point + Router + Route definitions
├── index.css             # Global styles
│
├── pages/                # หน้าต่างๆ (1 file = 1 route)
│   ├── Dashboard.jsx     # ภาพรวมสถิติ
│   ├── Courses.jsx       # รายการคอร์ส + filter/search
│   ├── CourseDetail.jsx  # รายละเอียดคอร์ส + enroll + certificate PDF
│   ├── RewardsStore.jsx  # แลก points เป็น badge / AI boost
│   ├── Leaderboard.jsx   # อันดับผู้ใช้ตาม points
│   ├── Profile.jsx       # โปรไฟล์ตัวเอง + แก้ชื่อ
│   ├── Users.jsx         # [Admin] รายชื่อผู้ใช้
│   ├── UserDetail.jsx    # [Admin] รายละเอียดผู้ใช้
│   ├── AdminCourses.jsx  # [Admin] จัดการคอร์ส
│   ├── AdminLessons.jsx  # [Admin] จัดการ lesson + quiz
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   └── ResetPassword.jsx
│
├── components/
│   ├── Layout.jsx        # Sidebar + nav + global search + streak display
│   ├── AiChat.jsx        # AI chat bubble (Gemini)
│   ├── CourseLessons.jsx # Video player + lesson list + progress tracking
│   ├── ProtectedRoute.jsx
│   ├── AdminRoute.jsx
│   └── ui/               # shadcn/ui components
│
├── hooks/
│   ├── useEnrollment.js      # enroll / drop / complete + local state
│   ├── useCourses.js         # merge static JSON + Firestore courses (realtime)
│   └── useAllEnrollments.js  # ดึง enrollments ทั้งหมด (สำหรับ admin analytics)
│
├── lib/
│   ├── AuthContext.jsx   # Firebase Auth + profile + streak tracking
│   ├── firebase.js       # Firebase config + init
│   ├── dataHelpers.js    # helper functions (getCategoryFromTitle, getCourseStats ฯลฯ)
│   └── utils.js          # cn() utility (Tailwind class merging)
│
└── data/
    ├── courses.json      # Seed data: 50 คอร์ส
    ├── users.json        # Seed data: ผู้ใช้ตัวอย่าง
    └── enrollments.json  # Seed data: enrollment ตัวอย่าง
```

---

## Firestore Data Model

### Collection: `users`
```
users/{uid}
├── name: string
├── email: string
├── role: "user" | "admin"
├── membership_role: "MEMBER" | "VIP"
├── loyalty_points: number
├── badges: string[]          // ["badge_scholar", "badge_achiever", ...]
├── streak: number            // จำนวนวันติดต่อกันที่ login
├── last_login_date: string   // "YYYY-MM-DD"
└── ai_boost_until: string?   // ISO date string
```

### Collection: `courses`
```
courses/{course_id}
├── title: string
├── instructor: string
├── total_lessons: number
├── description: string
└── youtube_url: string?
```

### Collection: `enrollments`
```
enrollments/{uid}_{course_id}
├── user_id: string
├── course_id: string
├── status: "IN_PROGRESS" | "COMPLETED" | "DROPPED"
└── progress_percent: number
```

### Collection: `lessons`
```
lessons/{lessonId}
├── course_id: string
├── title: string
├── video_url: string
├── order: number
└── quiz: { question, options[], answer }?
```


