"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { DonationCheckout } from "./donation-checkout"

export function StickyHeader() {
  const [showDonateModal, setShowDonateModal] = useState(false)
  const { scrollY } = useScroll()
  const headerBackground = useTransform(scrollY, [0, 100], ["rgba(20, 20, 30, 0)", "rgba(20, 20, 30, 0.85)"])
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 1px 0px rgba(255, 215, 0, 0.1)"],
  )

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBackground,
          boxShadow: headerShadow,
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl font-bold text-foreground"
          >
            🕉️ తాటిపల్లి హనుమాన్ మందిరం
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              onClick={() => setShowDonateModal(true)}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all duration-300 hover:scale-105"
            >
              <motion.span
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                విరాళం ఇవ్వండి
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {showDonateModal && <DonationCheckout onClose={() => setShowDonateModal(false)} />}
    </>
  )
}
