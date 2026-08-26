// endpoint ของ Vertex คืน list มาสองแบบไม่เหมือนกัน
//
//   GET /api/v1/admin/pets   →  [ ... ]                              array เปล่าๆ
//   GET /api/v1/auth/users   →  [ ... ]                              array เปล่าๆ
//   GET /api/v1/admin/events →  { data, total, limit, offset }       ห่อไว้
//
// หน้า Event Log เคยทำ `setLogs(await res.json())` ตรงๆ แล้วได้ object มา
// ตอน render `.map` จึงพัง ทั้งที่ request ตอบ 200 ปกติ — ดูเหมือน "ไม่มีข้อมูล"
// ส่วนหน้า Dashboard พังเงียบกว่านั้นอีก เพราะ `.filter` ไปโยน error อยู่ใน
// try/catch ของ fetch ผลคือจำนวน event วันนี้ขึ้น 0 โดยไม่มีอะไรฟ้อง
//
// ตัวนี้รับได้ทั้งสองแบบ endpoint ไหนเปลี่ยนไปห่อ/ไม่ห่อทีหลังก็ไม่พัง
export function toList<T = any>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}
