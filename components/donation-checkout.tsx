"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { X, IndianRupee } from "lucide-react"
import { DONATION_TIERS } from "@/lib/products"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface DonationCheckoutProps {
  tierId?: string
  tierName?: string
  amount?: number
  onClose: () => void
}

export function DonationCheckout({ tierId, tierName, amount, onClose }: DonationCheckoutProps) {
  const [step, setStep] = useState<"tier-selection" | "form" | "success">(tierId ? "form" : "tier-selection")
  const [selectedTierId, setSelectedTierId] = useState<string | undefined>(tierId)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [isCustomAmount, setIsCustomAmount] = useState(false)
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    isAnonymous: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const selectedTierData = DONATION_TIERS.find((t) => t.id === selectedTierId)

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCustomAmount) {
      const amount = Number.parseFloat(customAmount)
      if (!amount || amount < 100) {
        alert("దయచేసి కనీసం ₹100 నమోదు చేయండి")
        return
      }
    } else if (!selectedTierId) {
      alert("దయచేసి విరాళ స్థాయిని ఎంచుకోండి")
      return
    }

    setIsLoading(true)

    try {
      const amount = isCustomAmount ? Number.parseFloat(customAmount) : (selectedTierData?.priceInCents || 0) / 100

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          donorInfo,
          isCustomAmount,
          tierId: selectedTierId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await response.json()

      const options = {
        method: {
  upi: true,
  card: true,
  netbanking: true,
  wallet: true,
},

        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "తాట్‌పల్లిహనుమాన్ మందిరం",
        description: "మందిర నిర్మాణానికి విరాళం",
        prefill: {
          name: donorInfo.name,
          email: donorInfo.email,
          contact: donorInfo.phone,
        },
        theme: {
          color: "#d97706",
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature,
}),
            })

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed")
            }

            setStep("success")
            setIsLoading(false)
          } catch (error) {
            console.error("Payment verification failed:", error)
            alert("చెల్లింపు ధృవీకరణ విఫలమైంది. దయచేసి మద్దతును సంప్రదించండి.")
            setIsLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          },
        },
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()
    } catch (error) {
      console.error("Error creating order:", error)
      alert("ఆర్డర్ సృష్టించడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.")
      setIsLoading(false)
    }
  }

  if (step === "tier-selection") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="w-full max-w-4xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-2xl">
            <CardHeader className="relative">
              <Button onClick={onClose} variant="ghost" size="icon" className="absolute right-4 top-4 hover:bg-muted">
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl">మీ విరాళం ఎంచుకోండి</CardTitle>
              <CardDescription>కొనసాగడానికి విరాళం స్థాయిని ఎంచుకోండి లేదా మీ స్వంత మొత్తాన్ని నమోదు చేయండి</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DONATION_TIERS.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
                        selectedTierId === tier.id && !isCustomAmount ? "border-primary shadow-lg" : ""
                      }`}
                      onClick={() => {
                        setSelectedTierId(tier.id)
                        setIsCustomAmount(false)
                        setStep("form")
                      }}
                    >
                      <CardHeader className="text-center">
                        <div className="text-4xl mb-2">{tier.icon}</div>
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
                        <CardDescription className="text-sm">{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-primary">₹{(tier.priceInCents / 100).toFixed(0)}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Card
                  className={`border-2 transition-all ${
                    isCustomAmount ? "border-primary shadow-lg bg-primary/5" : "border-dashed hover:border-primary/50"
                  }`}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">
                      <IndianRupee className="w-12 h-12 mx-auto text-primary" />
                    </div>
                    <CardTitle className="text-lg">మీ స్వంత మొత్తం నమోదు చేయండి</CardTitle>
                    <CardDescription className="text-sm">మీరు విరాళంగా ఇవ్వాలనుకునే మొత్తాన్ని నమోదు చేయండి</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          min="100"
                          step="1"
                          placeholder="మొత్తం నమోదు చేయండి (కనిష్టం ₹100)"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setIsCustomAmount(true)
                            setSelectedTierId(undefined)
                          }}
                          onFocus={() => {
                            setIsCustomAmount(true)
                            setSelectedTierId(undefined)
                          }}
                          className="pl-8 text-lg"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (customAmount && Number.parseFloat(customAmount) >= 100) {
                          setStep("form")
                        } else {
                          alert("దయచేసి కనీసం ₹100 నమోదు చేయండి")
                        }
                      }}
                      className="w-full"
                      disabled={!customAmount || Number.parseFloat(customAmount) < 100}
                    >
                      ఈ మొత్తంతో కొనసాగండి
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-2xl mx-auto shadow-2xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
                  viewBox="0 0 50 50"
                  className="w-12 h-12"
                >
                  <motion.path
                    d="M 10 25 L 20 35 L 40 15"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
              <CardTitle className="text-3xl">ధన్యవాదాలు!</CardTitle>
              <CardDescription className="text-lg">మీ విరాళం స్వీకరించబడింది</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">మీ దానధర్మం మీకు మరియు మీ కుటుంబానికి ఆశీస్సులు తెస్తుంది.</p>
              <Button onClick={onClose} size="lg">
                హోమ్‌కు తిరిగి వెళ్ళండి
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="w-full max-w-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {step === "tier-selection" ? (
            <Card className="shadow-2xl">
              <CardHeader className="relative">
                <Button onClick={onClose} variant="ghost" size="icon" className="absolute right-4 top-4 hover:bg-muted">
                  <X className="h-5 w-5" />
                </Button>
                <CardTitle className="text-2xl">మీ విరాళం ఎంచుకోండి</CardTitle>
                <CardDescription>కొనసాగడానికి విరాళం స్థాయిని ఎంచుకోండి లేదా మీ స్వంత మొత్తాన్ని నమోదు చేయండి</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DONATION_TIERS.map((tier, index) => (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
                          selectedTierId === tier.id && !isCustomAmount ? "border-primary shadow-lg" : ""
                        }`}
                        onClick={() => {
                          setSelectedTierId(tier.id)
                          setIsCustomAmount(false)
                          setStep("form")
                        }}
                      >
                        <CardHeader className="text-center">
                          <div className="text-4xl mb-2">{tier.icon}</div>
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                          <CardDescription className="text-sm">{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="text-2xl font-bold text-primary">₹{(tier.priceInCents / 100).toFixed(0)}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <Card
                    className={`border-2 transition-all ${
                      isCustomAmount ? "border-primary shadow-lg bg-primary/5" : "border-dashed hover:border-primary/50"
                    }`}
                  >
                    <CardHeader className="text-center">
                      <div className="text-4xl mb-2">
                        <IndianRupee className="w-12 h-12 mx-auto text-primary" />
                      </div>
                      <CardTitle className="text-lg">మీ స్వంత మొత్తం నమోదు చేయండి</CardTitle>
                      <CardDescription className="text-sm">మీరు విరాళంగా ఇవ్వాలనుకునే మొత్తాన్ని నమోదు చేయండి</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            min="100"
                            step="1"
                            placeholder="మొత్తం నమోదు చేయండి (కనిష్టం ₹100)"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value)
                              setIsCustomAmount(true)
                              setSelectedTierId(undefined)
                            }}
                            onFocus={() => {
                              setIsCustomAmount(true)
                              setSelectedTierId(undefined)
                            }}
                            className="pl-8 text-lg"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (customAmount && Number.parseFloat(customAmount) >= 100) {
                            setStep("form")
                          } else {
                            alert("దయచేసి కనీసం ₹100 నమోదు చేయండి")
                          }
                        }}
                        className="w-full"
                        disabled={!customAmount || Number.parseFloat(customAmount) < 100}
                      >
                        ఈ మొత్తంతో కొనసాగండి
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xl">
              <CardHeader className="relative">
                <Button onClick={onClose} variant="ghost" size="icon" className="absolute right-4 top-4 hover:bg-muted">
                  <X className="h-5 w-5" />
                </Button>
                <CardTitle>మీ విరాళాన్ని పూర్తి చేయండి</CardTitle>
                <CardDescription>
                  {isCustomAmount
                    ? `కస్టమ్ విరాళం - ₹${Number.parseFloat(customAmount).toFixed(2)}`
                    : `${selectedTierData?.name} - ₹${selectedTierData ? (selectedTierData.priceInCents / 100).toFixed(2) : "0.00"}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Label htmlFor="name">పూర్తి పేరు *</Label>
                    <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Input
                        id="name"
                        required
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                        placeholder="మీ పూర్తి పేరు నమోదు చేయండి"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Label htmlFor="email">ఇమెయిల్ *</Label>
                    <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                        placeholder="your@email.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Label htmlFor="phone">ఫోన్ (ఐచ్ఛికం)</Label>
                    <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Input
                        id="phone"
                        type="tel"
                        value={donorInfo.phone}
                        onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Label htmlFor="message">సందేశం (ఐచ్ఛికం)</Label>
                    <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Textarea
                        id="message"
                        value={donorInfo.message}
                        onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                        placeholder="మీ ఆలోచనలు లేదా ప్రార్థనలు పంచుకోండి..."
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </motion.div>
                  </motion.div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={donorInfo.isAnonymous}
                      onCheckedChange={(checked) => setDonorInfo({ ...donorInfo, isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      నా విరాళాన్ని అనామకంగా చేయండి
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                      రద్దు చేయండి
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1 relative">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          ప్రాసెస్ అవుతోంది...
                        </span>
                      ) : (
                        "చెల్లింపుకు కొనసాగండి"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
