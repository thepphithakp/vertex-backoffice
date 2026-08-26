# vertex-backoffice

หน้า admin ของ Vertex — Preact + Vite build เป็น static file แล้วเสิร์ฟด้วย nginx

ใช้ดู dashboard, ตาราง pet, user และ event log · ทุกหน้าเรียก REST ของ
`auth-service` / `pet-service` / `event-service` ผ่าน ingress ตัวเดียวกับที่แอปมือถือใช้

## เสิร์ฟที่ /backoffice ไม่ใช่ root

`/` ของ host นี้เป็นของแอปอื่นในคลัสเตอร์อยู่ก่อนแล้ว (ดูหมายเหตุใน
`vertex-backend/infra/ingress`) แอปนี้จึงอยู่ใต้ prefix `/backoffice`

**สามที่นี้ต้องเป็นค่าเดียวกันเสมอ** ถ้าตัวใดตัวหนึ่งเพี้ยนจะได้หน้าขาว
โดยที่ nginx ไม่มี error อะไรให้เห็น

| ที่ | ค่า |
|---|---|
| `vite.config.ts` → `base` | `/backoffice/` |
| `nginx.conf` → `location` | `/backoffice` |
| `helm/vertex-backoffice/values.yaml` → `ingress.path` | `/backoffice` |

`preact-router` ไม่มี base prop — path ของทุก route จึงเติม prefix เองผ่าน
`src/routes.ts` **อย่าเขียน `path="/pets"` ตรงๆ** เพราะตอน dev จะดูปกติ
แล้วไปพังตอนขึ้นจริง

API เรียกด้วย path สัมพัทธ์ (`/api/v1/...`) ตลอด จึงไม่ต้องตั้ง base URL ที่ไหน —
แอปกับ API อยู่ host เดียวกัน

## รันในเครื่อง

```sh
cp .env.example .env.local   # ใส่ IP ของ ingress กับ host header จริง
npm ci
npm run dev                  # เปิด http://localhost:5173/backoffice/
```

`.env.local` ไม่ถูก commit เพราะ repo นี้เป็น public — **ห้ามใส่ hostname
หรือ IP จริงลงไฟล์ที่ commit** ค่าจริงส่งตอน deploy ผ่าน GitHub secret เท่านั้น

`npm run build` รัน `tsc -b` ก่อนเสมอ type error จึงหยุดตั้งแต่ตอน build
ไม่ใช่ไปโผล่ตอน runtime

## Deploy

GitHub Actions ทำให้อัตโนมัติเมื่อ push ขึ้น `main` — build → push image ขึ้น GHCR →
`helm upgrade` → รอ pod ready จริงก่อนถือว่าสำเร็จ

ค่าที่ต้องตั้งใน repo:

| ชื่อ | ชนิด | ใช้ทำอะไร |
|---|---|---|
| `KUBECONFIG_CONTENT` | secret | เข้าถึงคลัสเตอร์ (namespace `vertex`) |
| `INGRESS_HOST` | secret | host ของ ingress — เป็นค่าจริงจึงไม่เก็บใน repo |
| `GOOGLE_CLIENT_ID` | variable | client id ของ Google OAuth · ไม่ตั้งก็ deploy ผ่าน แต่ปุ่ม Google จะหายไป |

chart จะ **ปฏิเสธที่จะ render** ถ้าไม่ส่ง `ingress.host` ดีกว่าปล่อยให้ deploy
ค่าว่างขึ้นไปแล้วมาพังทีหลัง

deploy ด้วยมือ (กรณีต้องแก้ด่วน):

```sh
helm upgrade --install vertex-backoffice ./helm/vertex-backoffice \
  --namespace vertex \
  --set image.tag=sha-<commit> \
  --set ingress.host=<host จริง> \
  --wait --timeout 3m
```

## เรื่องที่เคยพลาดแล้วเสียเวลา

**nginx redirect `/backoffice` → `/backoffice/` โดยใส่ port ของตัวเองมาด้วย**
กลายเป็น `http://host:8080/backoffice/` ซึ่งจากนอกคลัสเตอร์เข้าไม่ถึง —
`absolute_redirect off` ใน `nginx.conf` แก้เรื่องนี้ ทดสอบแล้วว่าเกิดจริง

**readinessProbe ยิง `/backoffice/index.html` ไม่ใช่ `/healthz`** เพราะถ้า
`COPY dist` พลาด nginx ยังตอบ ok ที่ `/healthz` อยู่ทั้งที่ไม่มีไฟล์ให้เสิร์ฟเลย

**`index.html` ตั้ง `Cache-Control: no-store`** ไม่งั้น deploy ใหม่แล้ว browser
ยังถือ index เก่าที่ชี้ asset ก้อนที่ถูกลบไปแล้ว ผลคือหน้าขาวจนกว่าจะ hard refresh
ส่วนไฟล์ใน `assets/` มี hash ในชื่ออยู่แล้วจึง cache ยาวได้

## Google Sign-In

client id มาจาก `VITE_GOOGLE_CLIENT_ID` ตอน build (ฝังลง bundle เลยเพราะเป็น
static SPA) ไม่ได้ hardcode ไว้ใน source แล้ว — **ไม่ตั้งค่านี้ ปุ่ม Google จะไม่ขึ้น**
และหน้า login เหลือแค่ email/password ซึ่งยังใช้ได้ปกติ

origin ที่ใช้งานจริงต้องถูกเพิ่มใน Google Cloud Console (Authorized JavaScript
origins) ของ client id นั้นด้วย ไม่งั้นปุ่มจะขึ้น error ทั้งที่ตั้ง client id ถูก

## โครงสร้าง

```
src/routes.ts              path ของทุกหน้า — ที่เดียวที่รู้เรื่อง base path
src/components/NavLink.tsx ห่อ Link ของ preact-router ที่ type ไม่ตรงกับ preact 10.29
src/context/AuthContext    เก็บ token ใน localStorage และ logout เมื่อได้ 401
nginx.conf                 การเสิร์ฟ SPA และ cache policy
Dockerfile                 build ด้วย node แล้วเสิร์ฟด้วย nginx unprivileged (uid 101)
helm/vertex-backoffice/    chart สำหรับ deploy
```
