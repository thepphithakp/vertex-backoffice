import type { ComponentChildren, VNode } from 'preact';
import { Link } from 'preact-router/match';

// preact-router 4.1.2 ประกาศ props ของ Link ไว้เป็น JSX.HTMLAttributes<HTMLAnchorElement>
// ซึ่ง preact 10.29 ย้าย href ออกไปอยู่ AnchorHTMLAttributes แล้ว — ตัว runtime
// รับ href ตามปกติ ผิดแค่ที่ type ของ library
//
// ห่อไว้ที่เดียวแทนการ cast ทุกจุดที่เรียกใช้ วันที่ upstream แก้ type ให้ตรง
// ก็ลบไฟล์นี้ทิ้งแล้วกลับไป import Link ตรงๆ ได้เลย
type NavLinkProps = {
  href: string;
  className?: string;
  activeClassName?: string;
  children?: ComponentChildren;
};

export const NavLink = Link as unknown as (props: NavLinkProps) => VNode;
