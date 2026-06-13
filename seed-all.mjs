// seed-all.mjs — run: node seed-all.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyDZy3Wv56hctnWuKxnA9idzs2bHaKRKxsE",
  authDomain: "kaokai-edu-hackathon.firebaseapp.com",
  projectId: "kaokai-edu-hackathon",
  storageBucket: "kaokai-edu-hackathon.firebasestorage.app",
  messagingSenderId: "502776311035",
  appId: "1:502776311035:web:feb8f0ff08bb80cee0545e"
});
const db = getFirestore(app);

const SEED = [
  {
    course_id: 'c-102',
    lessons: [
      { id: 'l-102-1', order: 1, title: 'Business Email Writing', duration: '10:20', video_url: 'https://www.youtube.com/watch?v=TsOzc0qNipo', quiz: { question: 'ข้อใดเป็นการเปิด Email แบบ formal?', choices: ['Hey!', 'Dear Mr./Ms.', 'Yo', 'Sup'], answer: 1 } },
      { id: 'l-102-2', order: 2, title: 'การนำเสนองานภาษาอังกฤษ', duration: '12:30', video_url: 'https://www.youtube.com/watch?v=Unzc731iCUY', quiz: { question: 'ประโยคใดใช้เปิดการนำเสนอ?', choices: ["I'll be talking about...", 'Bye!', 'I dunno', 'Whatever'], answer: 0 } },
      { id: 'l-102-3', order: 3, title: 'Meeting Vocabulary', duration: '9:45', video_url: 'https://www.youtube.com/watch?v=oa0gF10GFXY', quiz: { question: '"Agenda" ในการประชุมหมายถึงอะไร?', choices: ['ผู้เข้าร่วม', 'วาระการประชุม', 'สถานที่', 'เวลา'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-104',
    lessons: [
      { id: 'l-104-1', order: 1, title: 'Cloud Computing Overview', duration: '11:00', video_url: 'https://www.youtube.com/watch?v=M988_fsOSWo', quiz: { question: 'Cloud Computing ให้บริการในรูปแบบใด?', choices: ['Hardware เท่านั้น', 'IaaS, PaaS, SaaS', 'Software เท่านั้น', 'Network เท่านั้น'], answer: 1 } },
      { id: 'l-104-2', order: 2, title: 'AWS S3 และ EC2 เบื้องต้น', duration: '14:15', video_url: 'https://www.youtube.com/watch?v=a9__D53WsUs', quiz: { question: 'AWS S3 ใช้สำหรับอะไร?', choices: ['Computing', 'Storage', 'Database', 'Networking'], answer: 1 } },
      { id: 'l-104-3', order: 3, title: 'Serverless Architecture', duration: '13:20', video_url: 'https://www.youtube.com/watch?v=wWEID0d6wfo', quiz: { question: 'Serverless หมายความว่าอย่างไร?', choices: ['ไม่มี Server เลย', 'ไม่ต้องจัดการ Server เอง', 'ใช้ Server ฟรี', 'Server อยู่ที่บ้าน'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-105',
    lessons: [
      { id: 'l-105-1', order: 1, title: 'Web Performance Optimization', duration: '16:00', video_url: 'https://www.youtube.com/watch?v=0fONene3OIA', quiz: { question: 'Core Web Vitals วัดอะไร?', choices: ['ความสวยงาม', 'ประสบการณ์ผู้ใช้', 'ขนาดไฟล์', 'จำนวน user'], answer: 1 } },
      { id: 'l-105-2', order: 2, title: 'Web Security Basics', duration: '14:30', video_url: 'https://www.youtube.com/watch?v=WlmKwIe9z1Q', quiz: { question: 'XSS ย่อมาจากอะไร?', choices: ['Extra Style Sheet', 'Cross-Site Scripting', 'XML Style System', 'eXtra Security'], answer: 1 } },
      { id: 'l-105-3', order: 3, title: 'RESTful API Design', duration: '18:10', video_url: 'https://www.youtube.com/watch?v=lsMQRaeKNDk', quiz: { question: 'HTTP Method ใดใช้ดึงข้อมูล?', choices: ['POST', 'DELETE', 'GET', 'PUT'], answer: 2 } },
    ]
  },
  {
    course_id: 'c-106',
    lessons: [
      { id: 'l-106-1', order: 1, title: 'HTML Structure', duration: '10:00', video_url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', quiz: { question: 'Tag ใดใช้ใส่ลิงก์ใน HTML?', choices: ['<link>', '<a>', '<href>', '<url>'], answer: 1 } },
      { id: 'l-106-2', order: 2, title: 'CSS Basics', duration: '11:30', video_url: 'https://www.youtube.com/watch?v=1PnVor36_40', quiz: { question: 'CSS selector # ใช้เลือกอะไร?', choices: ['Class', 'ID', 'Tag', 'Attribute'], answer: 1 } },
      { id: 'l-106-3', order: 3, title: 'Responsive Design', duration: '12:45', video_url: 'https://www.youtube.com/watch?v=srvUrASNj0s', quiz: { question: 'Media Query ใช้ทำอะไร?', choices: ['เล่นเสียง', 'ปรับ layout ตามหน้าจอ', 'โหลดรูป', 'สร้าง animation'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-107',
    lessons: [
      { id: 'l-107-1', order: 1, title: 'JavaScript ES6+ Features', duration: '15:20', video_url: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc', quiz: { question: 'Arrow function ใช้ syntax ใด?', choices: ['function() {}', '() => {}', 'fn() {}', 'func() {}'], answer: 1 } },
      { id: 'l-107-2', order: 2, title: 'Fetch API และ Async/Await', duration: '17:00', video_url: 'https://www.youtube.com/watch?v=cuEtnrL9-H0', quiz: { question: 'Async/Await ใช้แทนอะไร?', choices: ['for loop', 'if/else', 'Promise callback', 'switch'], answer: 2 } },
      { id: 'l-107-3', order: 3, title: 'Git พื้นฐาน', duration: '13:40', video_url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', quiz: { question: 'คำสั่ง git commit ทำอะไร?', choices: ['ส่งโค้ดขึ้น server', 'บันทึก snapshot ของโค้ด', 'ลบโค้ด', 'ดึงโค้ดมา'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-108',
    lessons: [
      { id: 'l-108-1', order: 1, title: 'System Design Basics', duration: '19:00', video_url: 'https://www.youtube.com/watch?v=FSR1s2b-l_I', quiz: { question: 'Load Balancer ทำหน้าที่อะไร?', choices: ['เก็บข้อมูล', 'กระจาย traffic', 'เขียน code', 'ทดสอบ'], answer: 1 } },
      { id: 'l-108-2', order: 2, title: 'Docker Containers', duration: '16:20', video_url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', quiz: { question: 'Docker Image คืออะไร?', choices: ['รูปภาพ', 'Template สำหรับ container', 'ฐานข้อมูล', 'เครือข่าย'], answer: 1 } },
      { id: 'l-108-3', order: 3, title: 'CI/CD Pipeline', duration: '14:50', video_url: 'https://www.youtube.com/watch?v=scEDHsr3APg', quiz: { question: 'CI/CD ย่อมาจากอะไร?', choices: ['Code Integration/Code Delivery', 'Continuous Integration/Continuous Delivery', 'Cloud Infrastructure/Cloud Deploy', 'ไม่มีข้อถูก'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-109',
    lessons: [
      { id: 'l-109-1', order: 1, title: 'Microservices Architecture', duration: '20:00', video_url: 'https://www.youtube.com/watch?v=rv4LlmLmVWk', quiz: { question: 'Microservices แตกต่างจาก Monolith อย่างไร?', choices: ['เล็กกว่า', 'แยก service อิสระ', 'เร็วกว่าเสมอ', 'ไม่ใช้ database'], answer: 1 } },
      { id: 'l-109-2', order: 2, title: 'DevOps Practices', duration: '17:30', video_url: 'https://www.youtube.com/watch?v=Xrgk023l4lI', quiz: { question: 'DevOps รวมทีมใดเข้าด้วยกัน?', choices: ['Sales & Marketing', 'Dev & Operations', 'Design & Dev', 'QA & Sales'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-110',
    lessons: [
      { id: 'l-110-1', order: 1, title: 'Blockchain คืออะไร', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=SSo_EIwHSd4', quiz: { question: 'Blockchain เก็บข้อมูลในรูปแบบใด?', choices: ['ตาราง', 'โซ่ของบล็อก', 'แฟ้ม', 'คลาวด์'], answer: 1 } },
      { id: 'l-110-2', order: 2, title: 'Consensus Mechanism', duration: '10:30', video_url: 'https://www.youtube.com/watch?v=ojxfbN78WFQ', quiz: { question: 'Proof of Work ใช้ทำอะไร?', choices: ['ยืนยัน transaction', 'เก็บรูปภาพ', 'ส่ง email', 'สร้าง website'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-111',
    lessons: [
      { id: 'l-111-1', order: 1, title: 'Mobile App Development Overview', duration: '11:15', video_url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc', quiz: { question: 'React Native ใช้พัฒนาแอปบนแพลตฟอร์มใด?', choices: ['iOS เท่านั้น', 'Android เท่านั้น', 'iOS และ Android', 'Windows เท่านั้น'], answer: 2 } },
      { id: 'l-111-2', order: 2, title: 'UI Components สำหรับมือถือ', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=obH0Po_RdWk', quiz: { question: 'ScrollView ใน Mobile ใช้ทำอะไร?', choices: ['เล่นวิดีโอ', 'เลื่อนดูเนื้อหา', 'ถ่ายรูป', 'โทรออก'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-112',
    lessons: [
      { id: 'l-112-1', order: 1, title: 'Project Management Basics', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=9LSnINglkQA', quiz: { question: 'Scrum เป็น framework ประเภทใด?', choices: ['Waterfall', 'Agile', 'V-Model', 'Spiral'], answer: 1 } },
      { id: 'l-112-2', order: 2, title: 'Agile & Scrum', duration: '15:20', video_url: 'https://www.youtube.com/watch?v=2Vt7Ik8Ublw', quiz: { question: 'Sprint ใน Scrum คืออะไร?', choices: ['การวิ่ง', 'รอบการทำงาน 1-4 สัปดาห์', 'การทดสอบ', 'การ deploy'], answer: 1 } },
      { id: 'l-112-3', order: 3, title: 'Kanban Board', duration: '9:10', video_url: 'https://www.youtube.com/watch?v=jf0tlbt9lx0', quiz: { question: 'Kanban Board แบ่งคอลัมน์พื้นฐานอย่างไร?', choices: ['Start/Middle/End', 'Todo/In Progress/Done', 'Red/Yellow/Green', 'Plan/Do/Check'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-113',
    lessons: [
      { id: 'l-113-1', order: 1, title: 'Video Editing Basics', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=zMzB2e_iISs', quiz: { question: 'Timeline ในโปรแกรมตัดต่อคืออะไร?', choices: ['ตารางเวลา', 'แถบแสดง clip เรียงตามเวลา', 'เมนูหลัก', 'หน้าต่าง export'], answer: 1 } },
      { id: 'l-113-2', order: 2, title: 'Color Grading', duration: '14:30', video_url: 'https://www.youtube.com/watch?v=zLMhSMFHKpk', quiz: { question: 'Color Grading คืออะไร?', choices: ['การตัดต่อเสียง', 'การปรับสีวิดีโอ', 'การใส่ subtitle', 'การ export'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-114',
    lessons: [
      { id: 'l-114-1', order: 1, title: 'Technical SEO', duration: '13:45', video_url: 'https://www.youtube.com/watch?v=JIMwd3EIhyg', quiz: { question: 'Sitemap ช่วย SEO อย่างไร?', choices: ['ทำให้เว็บสวยขึ้น', 'ช่วย Google crawl เว็บ', 'เพิ่ม traffic โดยตรง', 'ลด loading time'], answer: 1 } },
      { id: 'l-114-2', order: 2, title: 'Link Building', duration: '11:20', video_url: 'https://www.youtube.com/watch?v=BNHR6IQJGZs', quiz: { question: 'Backlink คืออะไร?', choices: ['ลิงก์ย้อนกลับจากเว็บอื่น', 'ลิงก์ภายในเว็บ', 'ลิงก์รูปภาพ', 'ลิงก์ broken'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-115',
    lessons: [
      { id: 'l-115-1', order: 1, title: 'Smart Contracts', duration: '16:00', video_url: 'https://www.youtube.com/watch?v=ZE2HxTmxfrI', quiz: { question: 'Smart Contract เขียนด้วยภาษาใดบน Ethereum?', choices: ['Python', 'Solidity', 'Java', 'C++'], answer: 1 } },
      { id: 'l-115-2', order: 2, title: 'DeFi Ecosystem', duration: '14:20', video_url: 'https://www.youtube.com/watch?v=17QRFlml4pA', quiz: { question: 'DeFi ย่อมาจากอะไร?', choices: ['Digital Finance', 'Decentralized Finance', 'Defined Finance', 'Direct Finance'], answer: 1 } },
      { id: 'l-115-3', order: 3, title: 'NFT และ Tokenization', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=Oz9zw7-_vhM', quiz: { question: 'NFT ย่อมาจากอะไร?', choices: ['New Financial Token', 'Non-Fungible Token', 'Network File Transfer', 'None'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-117',
    lessons: [
      { id: 'l-117-1', order: 1, title: 'R Programming Basics', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=_V8eKsto3Ug', quiz: { question: 'R ใช้สำหรับงานประเภทใดเป็นหลัก?', choices: ['Web Development', 'Statistical Analysis', 'Game Development', 'Mobile App'], answer: 1 } },
      { id: 'l-117-2', order: 2, title: 'Statistical Modeling', duration: '17:30', video_url: 'https://www.youtube.com/watch?v=7dSgCsFnLis', quiz: { question: 'ฟังก์ชัน lm() ใน R ใช้สำหรับ?', choices: ['Plot กราฟ', 'Linear Regression', 'Load Data', 'List variables'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-118',
    lessons: [
      { id: 'l-118-1', order: 1, title: 'Cybersecurity Fundamentals', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=inWWhr5tnEA', quiz: { question: 'Malware คืออะไร?', choices: ['Hardware เสีย', 'โปรแกรมอันตราย', 'ไฟล์ขนาดใหญ่', 'Network ช้า'], answer: 1 } },
      { id: 'l-118-2', order: 2, title: 'Phishing Attacks', duration: '10:45', video_url: 'https://www.youtube.com/watch?v=XBkzBrXlle0', quiz: { question: 'Phishing คืออะไร?', choices: ['การตกปลา', 'การหลอกให้เปิดเผยข้อมูล', 'การเขียนโค้ด', 'การ backup ข้อมูล'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-119',
    lessons: [
      { id: 'l-119-1', order: 1, title: 'Vue 3 Composition API', duration: '16:40', video_url: 'https://www.youtube.com/watch?v=I_xLMmNeLDY', quiz: { question: 'setup() ใน Vue 3 ใช้ทำอะไร?', choices: ['กำหนด style', 'จุดเริ่มต้นของ Composition API', 'สร้าง route', 'เชื่อม database'], answer: 1 } },
      { id: 'l-119-2', order: 2, title: 'Pinia State Management', duration: '14:10', video_url: 'https://www.youtube.com/watch?v=JGC7aAC-3y8', quiz: { question: 'Pinia ใช้แทน library ใด?', choices: ['Vue Router', 'Vuex', 'Axios', 'Vite'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-120',
    lessons: [
      { id: 'l-120-1', order: 1, title: 'Exposure Triangle', duration: '12:20', video_url: 'https://www.youtube.com/watch?v=YojL7UQTVhc', quiz: { question: 'Exposure Triangle ประกอบด้วยอะไร?', choices: ['Lens, Body, Flash', 'ISO, Aperture, Shutter Speed', 'White Balance, Focus, Zoom', 'Format, Size, Color'], answer: 1 } },
      { id: 'l-120-2', order: 2, title: 'Studio Lighting', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=o7c-hRdaHiY', quiz: { question: 'Key Light คืออะไร?', choices: ['แสงจาก key board', 'แสงหลักที่ส่องวัตถุ', 'แสง background', 'แสงตกแต่ง'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-121',
    lessons: [
      { id: 'l-121-1', order: 1, title: 'Story Structure', duration: '11:00', video_url: 'https://www.youtube.com/watch?v=erGEKFjI7lk', quiz: { question: 'Three-Act Structure ประกอบด้วยอะไร?', choices: ['Beginning/Middle/End', 'Intro/Body/Conclusion', 'Setup/Conflict/Resolution', 'Open/Action/Close'], answer: 2 } },
      { id: 'l-121-2', order: 2, title: 'Character Development', duration: '9:30', video_url: 'https://www.youtube.com/watch?v=8fOwi5oSb5g', quiz: { question: 'Protagonist คือใคร?', choices: ['ผู้ร้าย', 'ตัวละครหลัก', 'ผู้บรรยาย', 'ตัวละครสมทบ'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-122',
    lessons: [
      { id: 'l-122-1', order: 1, title: 'Content Marketing Strategy', duration: '13:30', video_url: 'https://www.youtube.com/watch?v=UoqdQkNkVcc', quiz: { question: 'Content Marketing มีเป้าหมายหลักคืออะไร?', choices: ['ขายสินค้าโดยตรง', 'สร้างคุณค่าให้กลุ่มเป้าหมาย', 'ลดต้นทุน', 'เพิ่มพนักงาน'], answer: 1 } },
      { id: 'l-122-2', order: 2, title: 'Social Media Marketing', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=qkioxoPhpx4', quiz: { question: 'KPI ย่อมาจากอะไร?', choices: ['Key Performance Indicator', 'Key Product Interest', 'Knowledge Performance Index', 'ไม่มีข้อถูก'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-123',
    lessons: [
      { id: 'l-123-1', order: 1, title: 'Angular Components', duration: '15:20', video_url: 'https://www.youtube.com/watch?v=3qBXWUpoPHo', quiz: { question: 'Decorator @Component ใช้ทำอะไร?', choices: ['สร้าง Service', 'กำหนด metadata ของ Component', 'สร้าง Route', 'เชื่อม API'], answer: 1 } },
      { id: 'l-123-2', order: 2, title: 'RxJS Observables', duration: '17:40', video_url: 'https://www.youtube.com/watch?v=T9wOu11uU6U', quiz: { question: 'Observable แตกต่างจาก Promise อย่างไร?', choices: ['เหมือนกัน', 'ส่งค่าได้หลายครั้ง', 'เร็วกว่าเสมอ', 'ใช้ใน Node.js เท่านั้น'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-125',
    lessons: [
      { id: 'l-125-1', order: 1, title: 'Design Systems', duration: '16:00', video_url: 'https://www.youtube.com/watch?v=EK-pHkc5EL4', quiz: { question: 'Design System คืออะไร?', choices: ['โปรแกรมออกแบบ', 'ชุดมาตรฐาน component และ guidelines', 'แค่ color palette', 'ชื่อ software'], answer: 1 } },
      { id: 'l-125-2', order: 2, title: 'Accessibility in Design', duration: '13:10', video_url: 'https://www.youtube.com/watch?v=qdB8SRhqvFc', quiz: { question: 'WCAG ย่อมาจากอะไร?', choices: ['Web Content Accessibility Guidelines', 'Web Code and Graphics', 'World Content Access Guide', 'Web Color and Grid'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-126',
    lessons: [
      { id: 'l-126-1', order: 1, title: 'Import & Organize Footage', duration: '10:30', video_url: 'https://www.youtube.com/watch?v=zMzB2e_iISs', quiz: { question: 'Bin ในโปรแกรมตัดต่อคืออะไร?', choices: ['ถังขยะ', 'โฟลเดอร์เก็บ media', 'Effect พิเศษ', 'Timeline'], answer: 1 } },
      { id: 'l-126-2', order: 2, title: 'Basic Cuts & Transitions', duration: '12:15', video_url: 'https://www.youtube.com/watch?v=GgbRKmFDvCM', quiz: { question: 'Jump Cut คืออะไร?', choices: ['การตัดที่มีการกระโดด', 'การตัดต่อแบบราบรื่น', 'การใส่เพลง', 'การเพิ่มสี'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-127',
    lessons: [
      { id: 'l-127-1', order: 1, title: 'กล้องและอุปกรณ์', duration: '11:00', video_url: 'https://www.youtube.com/watch?v=V7z7BAZdt2M', quiz: { question: 'ความยาวโฟกัสของ Lens คืออะไร?', choices: ['ขนาดกล้อง', 'ระยะมุมมองของภาพ', 'ความเร็ว shutter', 'ขนาด sensor'], answer: 1 } },
      { id: 'l-127-2', order: 2, title: 'Composition Rules', duration: '13:20', video_url: 'https://www.youtube.com/watch?v=7ZVyNjKSr0M', quiz: { question: 'Rule of Thirds คืออะไร?', choices: ['ถ่าย 3 รูป', 'แบ่งภาพเป็น 9 ส่วน', 'ใช้ 3 สี', 'ถ่าย 3 มุม'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-128',
    lessons: [
      { id: 'l-128-1', order: 1, title: 'Fast Track Editing Workflow', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=zMzB2e_iISs', quiz: { question: 'Proxy Editing ช่วยอะไร?', choices: ['เพิ่มคุณภาพ', 'ลด render time ขณะตัดต่อ', 'เพิ่มเสียง', 'ใส่ subtitle อัตโนมัติ'], answer: 1 } },
      { id: 'l-128-2', order: 2, title: 'Audio Mixing', duration: '11:40', video_url: 'https://www.youtube.com/watch?v=TEjOdqZFvhY', quiz: { question: 'Gain ในการ mix เสียงคืออะไร?', choices: ['ความเร็วเสียง', 'ระดับความดังของเสียง', 'ความถี่', 'echo'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-129',
    lessons: [
      { id: 'l-129-1', order: 1, title: 'Advanced R Programming', duration: '18:00', video_url: 'https://www.youtube.com/watch?v=_V8eKsto3Ug', quiz: { question: 'tidyverse ใน R คืออะไร?', choices: ['ชื่อ IDE', 'ชุด package สำหรับ data science', 'ฐานข้อมูล', 'ภาษาโปรแกรมใหม่'], answer: 1 } },
      { id: 'l-129-2', order: 2, title: 'Time Series Analysis', duration: '20:00', video_url: 'https://www.youtube.com/watch?v=JNfxr4BQrLk', quiz: { question: 'Time Series Data คืออะไร?', choices: ['ข้อมูลที่มีเวลากำกับ', 'ข้อมูลในตาราง', 'ข้อมูลสุ่ม', 'ข้อมูลรูปภาพ'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-130',
    lessons: [
      { id: 'l-130-1', order: 1, title: 'Intro to Data Science with R', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=_V8eKsto3Ug', quiz: { question: 'dplyr ใช้ทำอะไร?', choices: ['วาดกราฟ', 'จัดการข้อมูล', 'สร้าง model', 'เชื่อม database'], answer: 1 } },
      { id: 'l-130-2', order: 2, title: 'Data Visualization ด้วย ggplot2', duration: '15:30', video_url: 'https://www.youtube.com/watch?v=rfR9Nrpfnyg', quiz: { question: 'ggplot2 ใช้ทำอะไร?', choices: ['จัดการข้อมูล', 'สร้างกราฟ', 'train model', 'เขียน report'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-131',
    lessons: [
      { id: 'l-131-1', order: 1, title: 'Camera Settings', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=V7z7BAZdt2M', quiz: { question: 'ISO สูงส่งผลอย่างไร?', choices: ['ภาพสว่าง แต่มี noise มากขึ้น', 'ภาพมืด', 'ภาพคมชัดขึ้น', 'สีสดขึ้น'], answer: 0 } },
      { id: 'l-131-2', order: 2, title: 'Lighting Techniques', duration: '14:10', video_url: 'https://www.youtube.com/watch?v=o7c-hRdaHiY', quiz: { question: 'Golden Hour คืออะไร?', choices: ['เวลา 12.00 น.', 'เวลาหลังพระอาทิตย์ขึ้น/ก่อนตก', 'เวลากลางคืน', 'เวลา 18.00 น.'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-132',
    lessons: [
      { id: 'l-132-1', order: 1, title: 'Vue 3 Fundamentals', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=I_xLMmNeLDY', quiz: { question: 'v-bind ใน Vue ใช้ทำอะไร?', choices: ['วน loop', 'ผูก attribute กับข้อมูล', 'จัดการ event', 'กำหนด style'], answer: 1 } },
      { id: 'l-132-2', order: 2, title: 'Vue Router', duration: '13:20', video_url: 'https://www.youtube.com/watch?v=IHbGWImMEME', quiz: { question: 'router-view ใช้ทำอะไร?', choices: ['แสดง component ตาม route', 'สร้าง link', 'จัดการ state', 'เชื่อม API'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-133',
    lessons: [
      { id: 'l-133-1', order: 1, title: 'Machine Learning with R', duration: '19:00', video_url: 'https://www.youtube.com/watch?v=7dSgCsFnLis', quiz: { question: 'Overfitting คืออะไร?', choices: ['Model เรียนรู้ข้อมูล train มากเกินไป', 'Model เรียนรู้น้อยเกินไป', 'ข้อมูลมากเกินไป', 'Model เร็วเกินไป'], answer: 0 } },
      { id: 'l-133-2', order: 2, title: 'Clustering & Classification', duration: '17:00', video_url: 'https://www.youtube.com/watch?v=4b5d3muPQmA', quiz: { question: 'K-Means เป็น algorithm ประเภทใด?', choices: ['Supervised', 'Unsupervised', 'Semi-supervised', 'Reinforcement'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-134',
    lessons: [
      { id: 'l-134-1', order: 1, title: 'OOP ใน Python', duration: '16:00', video_url: 'https://www.youtube.com/watch?v=JeznW_7DlB0', quiz: { question: '__init__ ใน Python Class ใช้ทำอะไร?', choices: ['ลบ object', 'เริ่มต้น object', 'คัดลอก object', 'ส่งออก object'], answer: 1 } },
      { id: 'l-134-2', order: 2, title: 'NumPy และ Pandas', duration: '18:30', video_url: 'https://www.youtube.com/watch?v=vmEHCJofslg', quiz: { question: 'DataFrame ใน Pandas คืออะไร?', choices: ['กราฟ', 'ตารางข้อมูล 2 มิติ', 'รูปภาพ', 'เครือข่าย'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-135',
    lessons: [
      { id: 'l-135-1', order: 1, title: 'Next.js Fundamentals', duration: '17:00', video_url: 'https://www.youtube.com/watch?v=mTz0GXj8NN0', quiz: { question: 'Next.js รองรับ rendering แบบใด?', choices: ['CSR เท่านั้น', 'SSR เท่านั้น', 'CSR, SSR, SSG', 'ไม่มี rendering'], answer: 2 } },
      { id: 'l-135-2', order: 2, title: 'Full-Stack React Integration', duration: '20:00', video_url: 'https://www.youtube.com/watch?v=rCm5RVYKWVg', quiz: { question: 'API Route ใน Next.js อยู่ใน folder ใด?', choices: ['/components', '/pages/api', '/public', '/styles'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-136',
    lessons: [
      { id: 'l-136-1', order: 1, title: 'Typography', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=sByzHoiYFX0', quiz: { question: 'Kerning คืออะไร?', choices: ['ขนาดตัวอักษร', 'ระยะห่างระหว่างตัวอักษร', 'น้ำหนัก font', 'สีตัวอักษร'], answer: 1 } },
      { id: 'l-136-2', order: 2, title: 'Brand Identity Design', duration: '14:30', video_url: 'https://www.youtube.com/watch?v=l-S2Y3SF3mM', quiz: { question: 'Logo ที่ดีควรมีคุณสมบัติอะไร?', choices: ['ซับซ้อน', 'เรียบง่ายและจดจำได้ง่าย', 'ใช้สีมาก', 'มีรายละเอียดเยอะ'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-137',
    lessons: [
      { id: 'l-137-1', order: 1, title: 'Bitcoin คืออะไร', duration: '11:00', video_url: 'https://www.youtube.com/watch?v=41JCpzvnn88', quiz: { question: 'Bitcoin ถูกสร้างโดยใคร?', choices: ['Elon Musk', 'Satoshi Nakamoto', 'Bill Gates', 'Vitalik Buterin'], answer: 1 } },
      { id: 'l-137-2', order: 2, title: 'Crypto Wallet & Exchange', duration: '10:30', video_url: 'https://www.youtube.com/watch?v=d8IBpfs9bf4', quiz: { question: 'Private Key ควรเก็บอย่างไร?', choices: ['โพสต์ใน social media', 'เก็บไว้กับตัวเองอย่างปลอดภัย', 'บอกเพื่อน', 'จำให้ได้เท่านั้น'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-138',
    lessons: [
      { id: 'l-138-1', order: 1, title: 'Keyword Research', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=FnRIqFjhqhM', quiz: { question: 'Long-tail keyword คืออะไร?', choices: ['Keyword สั้น', 'Keyword ยาวและเฉพาะเจาะจง', 'Keyword ยอดนิยม', 'Keyword ภาษาไทย'], answer: 1 } },
      { id: 'l-138-2', order: 2, title: 'On-Page SEO', duration: '11:00', video_url: 'https://www.youtube.com/watch?v=JIMwd3EIhyg', quiz: { question: 'Meta Description ควรมีความยาวกี่ตัวอักษร?', choices: ['50 ตัว', '150-160 ตัว', '300 ตัว', '500 ตัว'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-139',
    lessons: [
      { id: 'l-139-1', order: 1, title: 'Network Security', duration: '10:00', video_url: 'https://www.youtube.com/watch?v=inWWhr5tnEA', quiz: { question: 'Firewall ทำหน้าที่อะไร?', choices: ['ดับไฟ', 'กรอง network traffic', 'เร่ง internet', 'เก็บ backup'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-140',
    lessons: [
      { id: 'l-140-1', order: 1, title: 'Enterprise SEO', duration: '15:00', video_url: 'https://www.youtube.com/watch?v=JIMwd3EIhyg', quiz: { question: 'Core Web Vitals ประกอบด้วยอะไร?', choices: ['LCP, FID, CLS', 'HTML, CSS, JS', 'SEO, SEM, SMO', 'ไม่มีข้อถูก'], answer: 0 } },
      { id: 'l-140-2', order: 2, title: 'International SEO', duration: '13:20', video_url: 'https://www.youtube.com/watch?v=BNHR6IQJGZs', quiz: { question: 'hreflang attribute ใช้สำหรับ?', choices: ['กำหนดสี', 'บอก Google ว่าเนื้อหาเป็นภาษาอะไร', 'ทำ redirect', 'สร้าง sitemap'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-141',
    lessons: [
      { id: 'l-141-1', order: 1, title: 'Dialogue Writing', duration: '9:00', video_url: 'https://www.youtube.com/watch?v=8fOwi5oSb5g', quiz: { question: 'บทสนทนาที่ดีควรเป็นอย่างไร?', choices: ['ยาวที่สุด', 'เป็นธรรมชาติและแสดงตัวละคร', 'ใช้คำยาก', 'บรรยายมาก'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-142',
    lessons: [
      { id: 'l-142-1', order: 1, title: 'Angular Forms', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=3qBXWUpoPHo', quiz: { question: 'Reactive Forms ใน Angular ใช้อะไร?', choices: ['ngModel', 'FormGroup/FormControl', 'v-model', 'useState'], answer: 1 } },
      { id: 'l-142-2', order: 2, title: 'HTTP Client & Services', duration: '15:30', video_url: 'https://www.youtube.com/watch?v=_05v0mrNLh0', quiz: { question: 'HttpClient ใน Angular ส่งคืนอะไร?', choices: ['Promise', 'Observable', 'Array', 'String'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-143',
    lessons: [
      { id: 'l-143-1', order: 1, title: 'Advanced Color Grading', duration: '9:00', video_url: 'https://www.youtube.com/watch?v=zLMhSMFHKpk', quiz: { question: 'LUTs ในการตัดต่อวิดีโอคืออะไร?', choices: ['ชื่อ software', 'Preset สีสำเร็จรูป', 'เพลงประกอบ', 'ชื่อ effect'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-144',
    lessons: [
      { id: 'l-144-1', order: 1, title: 'Cloud Services Overview', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=M988_fsOSWo', quiz: { question: 'PaaS ย่อมาจากอะไร?', choices: ['Platform as a Service', 'Payment as a Service', 'Process as a Service', 'Private as a Service'], answer: 0 } },
      { id: 'l-144-2', order: 2, title: 'Virtual Machines', duration: '14:20', video_url: 'https://www.youtube.com/watch?v=a9__D53WsUs', quiz: { question: 'Virtual Machine คืออะไร?', choices: ['เครื่องจริง', 'คอมพิวเตอร์เสมือนใน software', 'ชื่อ OS', 'ชื่อ Hardware'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-145',
    lessons: [
      { id: 'l-145-1', order: 1, title: 'Art Direction', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=l-S2Y3SF3mM', quiz: { question: 'Art Director ทำหน้าที่อะไร?', choices: ['เขียนโค้ด', 'กำหนดทิศทางภาพรวมของงานออกแบบ', 'จัดการ budget', 'ดูแล HR'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-146',
    lessons: [
      { id: 'l-146-1', order: 1, title: 'OWASP Top 10', duration: '14:00', video_url: 'https://www.youtube.com/watch?v=WlmKwIe9z1Q', quiz: { question: 'SQL Injection คืออะไร?', choices: ['การฉีดยา', 'การโจมตีฐานข้อมูลผ่าน SQL', 'การ backup', 'การ update software'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-147',
    lessons: [
      { id: 'l-147-1', order: 1, title: 'SOC Operations', duration: '13:00', video_url: 'https://www.youtube.com/watch?v=inWWhr5tnEA', quiz: { question: 'SOC ย่อมาจากอะไร?', choices: ['Security Operations Center', 'Software Open Code', 'System On Chip', 'Service Output Control'], answer: 0 } },
    ]
  },
  {
    course_id: 'c-148',
    lessons: [
      { id: 'l-148-1', order: 1, title: 'Hash Functions', duration: '11:00', video_url: 'https://www.youtube.com/watch?v=SSo_EIwHSd4', quiz: { question: 'Hash Function มีคุณสมบัติอะไร?', choices: ['ย้อนกลับได้', 'ไม่สามารถย้อนกลับได้ง่าย', 'เหมือนกันทุกครั้ง', 'สุ่มเสมอ'], answer: 1 } },
      { id: 'l-148-2', order: 2, title: 'Blockchain in Supply Chain', duration: '13:30', video_url: 'https://www.youtube.com/watch?v=ojxfbN78WFQ', quiz: { question: 'Blockchain ช่วย Supply Chain อย่างไร?', choices: ['ลดราคาสินค้า', 'เพิ่มความโปร่งใสและตรวจสอบได้', 'เร่งการผลิต', 'ลดแรงงาน'], answer: 1 } },
    ]
  },
  {
    course_id: 'c-149',
    lessons: [
      { id: 'l-149-1', order: 1, title: 'Packaging Design', duration: '12:00', video_url: 'https://www.youtube.com/watch?v=l-S2Y3SF3mM', quiz: { question: 'Packaging Design ต้องคำนึงถึงอะไร?', choices: ['ความสวยอย่างเดียว', 'ความสวย ฟังก์ชัน และ brand', 'ราคาต้นทุนอย่างเดียว', 'สีที่ชอบ'], answer: 1 } },
    ]
  },
];

async function seed() {
  let total = 0;
  for (const { course_id, lessons } of SEED) {
    for (const { id, quiz, ...lessonData } of lessons) {
      await setDoc(doc(db, 'courses', course_id, 'lessons', id), lessonData);
      if (quiz) await setDoc(doc(db, 'courses', course_id, 'lessons', id, 'quiz', 'q1'), quiz);
      console.log(`✓ ${course_id} / ${id}`);
      total++;
    }
  }
  console.log(`\nDone! ${total} lessons across ${SEED.length} courses.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
