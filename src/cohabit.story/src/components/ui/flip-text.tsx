import React, { useMemo } from "react"
import { cn } from "@/lib/utils"

interface FlipTextProps {
  className?: string
  children: string
  duration?: number
  delay?: number
  loop?: boolean
  separator?: string
  together?: boolean
}

export function FlipText({
  className,
  children,
  duration = 2.2,
  delay = 0,
  loop = true,
  separator = " ",
  together = false,
}: FlipTextProps) {
  const words = useMemo(() => children.split(separator), [children, separator])
  const totalChars = children.length

  const getCharIndex = (wordIndex: number, charIndex: number) => {
    let index = 0
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length)
    }
    return index + charIndex
  }

  return (
    <div
      className={cn("flip-text-wrapper inline-block leading-none", className)}
      style={{ perspective: "1000px" }}
    >
      {words.map((word, wordIndex) => {
        const chars = word.split("")

        return (
          <span
            key={wordIndex}
            className="word inline-block whitespace-nowrap"
            style={{ transformStyle: "preserve-3d" }}
          >
            {chars.map((char, charIndex) => {
              const currentGlobalIndex = getCharIndex(wordIndex, charIndex)

              let calculatedDelay = delay
              if (!together) {
                const normalizedIndex = currentGlobalIndex / totalChars
                const sineValue = Math.sin(
                  normalizedIndex * (Math.PI / 2),
                )
                calculatedDelay = sineValue * (duration * 0.25) + delay
              }

              return (
                <span
                  key={charIndex}
                  className="flip-char relative inline-block"
                  data-char={char}
                  style={
                    {
                      "--flip-duration": `${duration}s`,
                      "--flip-delay": `${calculatedDelay}s`,
                      "--flip-iteration": loop ? "infinite" : "1",
                      transformStyle: "preserve-3d",
                    } as React.CSSProperties
                  }
                >
                  {char}
                </span>
              )
            })}
            {separator === " " && wordIndex < words.length - 1 && (
              <span className="whitespace inline-block">&nbsp;</span>
            )}
            {separator !== " " && wordIndex < words.length - 1 && (
              <span className="separator inline-block">{separator}</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default FlipText
