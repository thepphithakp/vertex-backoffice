import { defineConfig, loadEnv } from 'vite'
import preact from '@preact/preset-vite'

// เสิร์ฟที่ /backoffice ไม่ใช่ root เพราะ root ของ host นั้นมีแอปอื่นถืออยู่แล้ว
// ตั้งค่าเดียวกันทั้ง dev และ production เพื่อไม่ให้ path เพี้ยนเฉพาะตอนขึ้นจริง
const BASE = '/backoffice/'

export default defineConfig(({ mode }) => {
  // อ่านจาก .env.local ซึ่งไม่ถูก commit — repo นี้เป็น public
  // จึงห้ามมี hostname หรือ IP จริงอยู่ในไฟล์ ดู .env.example
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: BASE,
    plugins: [preact()],
    server: {
      proxy: env.DEV_API_TARGET
        ? {
            '/api': {
              target: env.DEV_API_TARGET,
              changeOrigin: true,
              secure: false,
              // ingress route ตาม host header ถ้าไม่ส่งไปจะไม่เจอ rule ของ vertex
              headers: env.DEV_API_HOST ? { Host: env.DEV_API_HOST } : undefined,
            },
          }
        : undefined,
    },
  }
})
