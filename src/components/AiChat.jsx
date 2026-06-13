import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { courses, enrollments, users, getCategoryFromTitle, getLevelFromTitle, getTopCoursesByEnrollment, getStatusBreakdown } from '@/lib/dataHelpers';
import { cn } from '@/lib/utils';

function buildSystemContext() {
  const topCourses = getTopCoursesByEnrollment(5).map(({ course, enrollmentCount }) =>
    `"${course?.title}" (${enrollmentCount} enrollments, instructor: ${course?.instructor})`
  ).join(', ');
  const statusBreakdown = getStatusBreakdown();
  const vipCount = users.filter(u => u.role === 'VIP').length;
  const completionRate = Math.round((statusBreakdown.COMPLETED / enrollments.length) * 100);
  const courseList = courses.map(c => {
    const enrolled = enrollments.filter(e => e.course_id === c.course_id).length;
    const completed = enrollments.filter(e => e.course_id === c.course_id && e.status === 'COMPLETED').length;
    return `- ${c.title} | Instructor: ${c.instructor} | Lessons: ${c.total_lessons} | Category: ${getCategoryFromTitle(c.title)} | Level: ${getLevelFromTitle(c.title)} | Enrolled: ${enrolled} | Completed: ${completed}`;
  }).join('\n');

  return `You are an intelligent assistant for LearnHub — an online learning platform. You have full knowledge of the platform's data.

PLATFORM SUMMARY:
- Total Users: ${users.length} (${vipCount} VIP, ${users.length - vipCount} Members)
- Total Courses: ${courses.length}
- Total Enrollments: ${enrollments.length}
- Overall Completion Rate: ${completionRate}%
- Enrollment Status: ${statusBreakdown.COMPLETED} completed, ${statusBreakdown.IN_PROGRESS} in progress, ${statusBreakdown.NOT_STARTED} not started, ${statusBreakdown.DROPPED} dropped

TOP 5 MOST ENROLLED COURSES: ${topCourses}

ALL COURSES:
${courseList}

Answer questions about courses, statistics, recommendations, instructors, and learning paths. Be helpful, concise, and friendly. Respond in the same language as the user (Thai or English).`;
}

const SUGGESTIONS = [
  'คอร์สไหนยอดนิยมที่สุด?',
  'แนะนำคอร์สสำหรับมือใหม่',
  'คอร์ส Programming มีอะไรบ้าง?',
  'อัตราการเรียนจบเป็นเท่าไร?',
];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

async function callAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error('NO_API_KEY');
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.choices[0].message.content;
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const context = buildSystemContext();
      const conversationHistory = newMessages.slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
      const prompt = `${context}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nPlease respond to the user's latest message.`;
      const reply = await callAI(prompt);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err.message === 'NO_API_KEY'
        ? 'AI ยังไม่ได้ตั้งค่า API Key (VITE_OPENAI_API_KEY) ค่ะ'
        : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={cn('fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300',
          'bg-gradient-to-br from-violet-600 to-indigo-600 hover:scale-110 active:scale-95',
          open && 'opacity-0 pointer-events-none scale-90')}
        aria-label="Open AI Chat">
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">LearnHub AI</p>
              <p className="text-violet-200 text-xs">ถามเรื่องคอร์สได้เลย</p>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close chat">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm text-sm text-slate-700 max-w-[85%]">
                    สวัสดี! ฉันคือ AI ผู้ช่วยของ LearnHub 🎓<br />สามารถถามเรื่องคอร์สเรียน, สถิติ, หรือขอคำแนะนำได้เลย!
                  </div>
                </div>
                <div className="ml-9 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">ลองถามว่า:</p>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)}
                      className="block w-full text-left text-xs bg-white border border-violet-100 text-violet-700 px-3 py-2 rounded-xl hover:bg-violet-50 hover:border-violet-300 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn('flex items-start gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn('px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm whitespace-pre-wrap leading-relaxed',
                  m.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none')}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                  <span className="text-xs text-slate-400">กำลังคิด...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="พิมพ์คำถามที่นี่..." disabled={loading}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-slate-50 disabled:opacity-50" />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send message">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
