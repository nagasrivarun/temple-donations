"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { DonationCheckout } from "./donation-checkout"

export function HeroSection() {
  const [showDonateModal, setShowDonateModal] = useState(false)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const titleY = useTransform(scrollY, [0, 600], [0, -25])
  const subtitleY = useTransform(scrollY, [0, 600], [0, -20])


  return (
    <>
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div
  className="absolute left-[15%] top-[45%] w-20 h-20 rounded-full
             bg-amber-500/40 blur-2xl z-0"
  animate={{
    y: [0, -20, 0],
    x: [0, 6, 0],
    scale: [1, 1.05, 1],
    opacity: [0.6, 0.9, 0.6],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
<motion.div
  className="absolute right-[18%] top-[55%] w-14 h-14 rounded-full
             bg-orange-400/40 blur-xl z-0"
  animate={{
    y: [0, -15, 0],
    x: [0, -4, 0],
    scale: [1, 1.04, 1],
    opacity: [0.5, 0.8, 0.5],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>

        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.06),transparent_70%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-slate-950/40" />
          {/* Soft vignette effect for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-20 left-10 w-64 h-64 bg-amber-600/40 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-600/40 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-600/30 rounded-full blur-3xl" />
          </div>
        </motion.div>

        <motion.div style={{ opacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <motion.h1
  style={{ y: titleY }}
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
  className="text-5xl md:text-7xl font-extrabold tracking-wide mb-6 text-amber-100"
>

            తాట్‌పల్లిహనుమాన్ మందిరం
          </motion.h1>

          <motion.p
  style={{ y: subtitleY }}
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.2 }}
  className="text-xl md:text-2xl font-medium leading-relaxed text-amber-200"
>

            తరతరాలకు ఆధ్యాత్మిక కేంద్రంగా నిలిచే పవిత్ర ఆలయ నిర్మాణంలో భాగస్వాములు అవ్వండి
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Button
              onClick={() => setShowDonateModal(true)}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
            >
              విరాళం ఇవ్వండి
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {showDonateModal && <DonationCheckout onClose={() => setShowDonateModal(false)} />}
    </>
  )
}
