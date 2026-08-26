// ทุก path ของ router ต้องเติม base เอง เพราะ preact-router ไม่มี base prop
//
// แอปถูกเสิร์ฟที่ /backoffice ไม่ใช่ root — root ของ host นี้เป็นของ homebridge
// อยู่ก่อนแล้ว (ดู infra/ingress/vertex-ingress.yaml) ถ้าเขียน path เป็น '/'
// ตรงๆ router จะไม่ match อะไรเลยตอนขึ้น production ทั้งที่ตอน dev ดูปกติ
//
// BASE_URL มาจาก base ใน vite.config.ts และลงท้ายด้วย / เสมอ
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const routes = {
  dashboard: BASE || '/',
  pets: `${BASE}/pets`,
  users: `${BASE}/users`,
  events: `${BASE}/events`,
} as const;
