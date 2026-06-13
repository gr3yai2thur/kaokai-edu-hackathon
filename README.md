# KaoKai Education Platform

แพลตฟอร์มการเรียนออนไลน์ที่รองรับทั้งผู้เรียนและผู้ดูแลระบบ มีระบบ points, badges, leaderboard, AI chat assistant และใบประกาศนียบัตร PDF

---

## เริ่มต้นใช้งาน

### รัน Local
```bash
npm install
npm run dev
```

### Environment Variables
สร้างไฟล์ `.env` ที่ root:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GEMINI_API_KEY=...
```

### Build & Deploy
```bash
npm run build        # output อยู่ที่ dist/
firebase deploy      # หรือ deploy บน Vercel / Netlify
```

---

## การใช้งาน — ผู้เรียน (User)

| หน้า | การใช้งาน |
|------|-----------|
| **Dashboard** | progress bar รวม (จบ X/Y คอร์ส), streak ของวัน, กราฟความนิยมคอร์ส |
| **Courses** | ค้นหาด้วยชื่อ/อาจารย์, กรอง category/level/instructor, กดเริ่มเรียน / drop / mark complete |
| **Course Detail** | ดูวิดีโอ YouTube preview, เรียนผ่าน video player, ดาวน์โหลด Certificate PDF เมื่อเรียนจบ |
| **Rewards Store** | แลก points เป็น Badge หรือ AI Boost (7 วัน) |
| **Leaderboard** | อันดับผู้ใช้ทั้งหมดตาม points, ไฮไลต์ตัวเอง |
| **Profile** | แก้ชื่อแสดงผล, ดู stats (points, streak, คอร์สจบ), badges ที่ได้รับ |
| **AI Chat** | กดปุ่มมุมขวาล่าง ถามคำถามเกี่ยวกับการเรียน (ต้องมี AI Boost หรือ quota ปกติ) |
| **Global Search** | พิมพ์ชื่อคอร์สใน search bar ที่ sidebar กด Enter → ไปหน้า Courses พร้อม filter |

### Loyalty Points
- เรียนจบ 1 คอร์ส = `จำนวน lessons × 10` points
- สะสมครบ 1,000 pts → อัปเกรดเป็น **VIP** อัตโนมัติ

### Streak 🔥
- Login ทุกวันติดต่อกัน → streak +1
- ขาด 1 วัน → streak reset เป็น 1

---

## การใช้งาน — Admin

| หน้า | การใช้งาน |
|------|-----------|
| **Dashboard** | KPI ครบ: total users/courses/enrollments, completion rate, pie chart status, student summary |
| **Users** | รายชื่อผู้ใช้ทั้งหมด, ค้นหา, กรอง role |
| **User Detail** | ดู enrollment history ของ user แต่ละคน |
| **Manage Courses** | เพิ่ม/แก้ไข/ลบคอร์ส, ใส่ YouTube URL preview |
| **Manage Lessons** | จัดการ lesson ในแต่ละคอร์ส, เพิ่ม quiz หลังวิดีโอ |

---

> ดูรายละเอียด Architecture, Tech Stack และ Data Model ได้ที่ [ARCHITECTURE.md](./ARCHITECTURE.md)
