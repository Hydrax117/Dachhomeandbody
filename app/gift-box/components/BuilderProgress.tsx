"use client"

import { motion } from "framer-motion"
import { useGiftBuilder, type BuilderStep } from "@/app/gift-box/context/GiftBuilderContext"

const steps: { key: BuilderStep; label: string; number: number }[] = [
  { key: "select-box", label: "Choose Style", number: 1 },
  { key: "select-size", label: "Choose Size", number: 2 },
  { key: "build", label: "Add Products", number: 3 },
  { key: "customize", label: "Personalise", number: 4 },
  { key: "summary", label: "Review", number: 5 },
]

const stepOrder: BuilderStep[] = [
  "select-box",
  "select-size",
  "build",
  "customize",
  "summary",
]

export default function BuilderProgress() {
  const { state, setStep } = useGiftBuilder()
  const currentIndex = stepOrder.indexOf(state.step)

  const canNavigateTo = (step: BuilderStep): boolean => {
    const targetIndex = stepOrder.indexOf(step)
    if (targetIndex > currentIndex) return false
    if (step === "select-size" && !state.selectedBox) return false
    if (step === "build" && !state.selectedSizeTier) return false
    if (step === "customize" && state.items.length === 0) return false
    if (step === "summary" && state.items.length === 0) return false
    return true
  }

  return (
    <nav aria-label="Gift builder steps" className="w-full">
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, idx) => {
          const isActive = state.step === step.key
          const isCompleted = stepOrder.indexOf(step.key) < currentIndex
          const isNavigable = canNavigateTo(step.key)

          return (
            <div key={step.key} className="flex items-center">
              {/* Step */}
              <button
                onClick={() => isNavigable && setStep(step.key)}
                disabled={!isNavigable}
                aria-current={isActive ? "step" : undefined}
                className={`flex flex-col items-center gap-2 px-3 sm:px-4 py-2 transition-all duration-300 ${
                  isNavigable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Circle */}
                <div
                  className={`relative w-8 h-8 flex items-center justify-center transition-all duration-400 ${
                    isActive
                      ? "bg-[#111111]"
                      : isCompleted
                      ? "bg-[#B8965C]"
                      : "bg-[#e5e5e5]"
                  }`}
                >
                  {isCompleted ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  ) : (
                    <span
                      className={`text-[11px] font-medium ${
                        isActive ? "text-white" : "text-[#8C8C8C]"
                      }`}
                    >
                      {step.number}
                    </span>
                  )}

                  {/* Active pulse */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-[#111111]"
                      animate={{ opacity: [0.4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 hidden sm:block ${
                    isActive
                      ? "text-[#111111]"
                      : isCompleted
                      ? "text-[#B8965C]"
                      : "text-[#C4C4C4]"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="w-8 lg:w-14 h-px bg-[#e5e5e5] relative overflow-hidden mx-0.5">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#B8965C]"
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        stepOrder.indexOf(steps[idx + 1].key) <= currentIndex
                          ? "100%"
                          : "0%",
                    }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
