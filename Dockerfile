# ---------- build ----------
FROM node:lts-alpine AS build

WORKDIR /app

# ลอก manifest มาก่อนเพื่อให้ layer ของ npm ci ถูก cache ไว้
# ตราบใดที่ dependency ไม่เปลี่ยน
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# build ผ่าน tsc ก่อนเสมอ (ดู script build ใน package.json)
# type error จึงทำให้ image build ล้ม ไม่ใช่ไปโผล่ตอน runtime
RUN npm run build

# ---------- runtime ----------
# unprivileged: รันด้วย uid 101 และ listen 8080 มาให้แล้ว
# ไม่ต้องแก้ config ให้ nginx เขียน /var/run ตอน start เหมือน image ปกติ
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# วางไว้ใต้ /backoffice ให้ path บน disk ตรงกับ path ที่ ingress ส่งมา
# จะได้ไม่ต้องใช้ rewrite ที่ ingress ซึ่งพังเงียบง่าย
COPY --from=build /app/dist /usr/share/nginx/html/backoffice

EXPOSE 8080
