"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

export default function GiftBoxFAB() {
  const pathname = usePathname()

  // Hide on the gift box builder itself and on admin pages
  if (pathname.startsWith("/gift-box") || pathname.startsWith("/admin")) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link
        href="/gift-box"
        aria-label="Build a gift box"
        className="group flex items-center gap-0 overflow-hidden bg-[#111111] text-white shadow-[0_8px_32px_0_rgb(17_17_17/0.25)] hover:shadow-[0_8px_40px_0_rgb(184_150_92/0.3)] transition-all duration-500"
      >
        {/* Icon */}
        <div className="w-14 h-14 flex items-center justify-center shrink-0">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.4 }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[#B8965C]"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </motion.div>
        </div>

        {/* Label — slides in on hover */}
        <div className="max-w-0 group-hover:max-w-[160px] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
          <span className="pr-5 text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap text-white/90">
            Build Gift Box
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
