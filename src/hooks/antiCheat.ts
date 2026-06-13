import { useCallback, useEffect, useState } from 'react'
import { quizApi } from '../api/quizzes'

type AntiCheatSummary = {
  tabSwitches: number
  pasteActions: number
}

export function useAntiCheat(attemptId?: number) {
  const [summary, setSummary] = useState<AntiCheatSummary>({
    tabSwitches: 0,
    pasteActions: 0,
  })

  const recordEvent = useCallback(
    async (event: string) => {
      if (!attemptId) return

      try {
        await quizApi.recordEvent(attemptId, event)
      } catch {
        // Anti-cheat logging should not block the quiz experience.
      }
    },
    [attemptId]
  )

  useEffect(() => {
    if (!attemptId) return

    const handleBlur = () => {
      setSummary((current) => ({
        ...current,
        tabSwitches: current.tabSwitches + 1,
      }))

      void recordEvent(`blur:${new Date().toISOString()}`)
    }

    const handleFocus = () => {
      void recordEvent(`focus:${new Date().toISOString()}`)
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [attemptId, recordEvent])

  const recordPaste = useCallback(
    (questionId: number) => {
      setSummary((current) => ({
        ...current,
        pasteActions: current.pasteActions + 1,
      }))

      void recordEvent(`paste:question-${questionId}:${new Date().toISOString()}`)
    },
    [recordEvent]
  )

  const resetSummary = () => {
    setSummary({
      tabSwitches: 0,
      pasteActions: 0,
    })
  }

  return {
    summary,
    recordPaste,
    resetSummary,
  }
}
