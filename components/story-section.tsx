"use client"

import { AnimatedSection } from "./animated-section"
import { AnimatedImage } from "./animated-image"

interface StorySectionProps {
  title: string
  description: string[]
  imageSrc: string
  imageAlt: string
  imagePosition?: "left" | "right"
}

export function StorySection({
  title,
  description,
  imageSrc,
  imageAlt,
  imagePosition = "right",
}: StorySectionProps) {
  const isImageLeft = imagePosition === "left"

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className={`grid md:grid-cols-2 gap-12 items-center ${
            isImageLeft ? "md:grid-flow-dense" : ""
          }`}
        >
          {/* TEXT CONTENT */}
          <AnimatedSection
            direction={isImageLeft ? "right" : "left"}
            className={`space-y-6 ${isImageLeft ? "md:col-start-2" : ""}`}
          >
            <h2 className="text-4xl font-bold text-balance">
              {title}
            </h2>

            {/* Telugu-optimized description block */}
            <div className="text-[1.05rem] leading-[1.55] space-y-2 text-muted-foreground">
              {description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </AnimatedSection>

          {/* IMAGE */}
          <AnimatedImage
            src={imageSrc}
            alt={imageAlt}
            delay={0.2}
            className={`rounded-2xl overflow-hidden shadow-2xl ${
              isImageLeft ? "md:col-start-1 md:row-start-1" : ""
            }`}
          />
        </div>
      </div>
    </section>
  )
}
