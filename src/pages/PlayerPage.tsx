import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { quizApi } from '../api/quizzes'
import { useAntiCheat } from '../hooks/antiCheat'
import type { StartAttemptResponse, SubmitResult } from '../types/quiz'

export default function PlayerPage() {
  const [quizId, setQuizId] = useState('')
  const [attempt, setAttempt] = useState<StartAttemptResponse | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const antiCheat = useAntiCheat(attempt?.id)

  const currentQuestion = attempt?.quiz.questions[currentQuestionIndex]
  const totalQuestions = attempt?.quiz.questions.length ?? 0
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const scorePercent =
    result && totalQuestions > 0
      ? Math.round((result.score / totalQuestions) * 100)
      : null

  const updateAnswer = (questionId: number, value: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  const loadQuizMutation = useMutation({
    mutationFn: () => {
      setErrorMessage('')

      if (!quizId.trim()) {
        throw new Error('Quiz ID is required')
      }

      if (Number.isNaN(Number(quizId))) {
        throw new Error('Quiz ID must be a number')
      }

      return quizApi.startAttempt(Number(quizId))
    },

    onSuccess: (data) => {
      setAttempt(data)
      setAnswers({})
      setResult(null)
      setCurrentQuestionIndex(0)
      antiCheat.resetSummary()
    },

    onError: (error) => {
      setErrorMessage((error as Error).message)
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage('')

      if (!attempt) {
        throw new Error('No active attempt')
      }

      for (const question of attempt.quiz.questions) {
        const answer = answers[question.id]

        if (!answer?.trim()) {
          throw new Error('Please answer all questions before submitting')
        }
      }

      for (const [questionId, value] of Object.entries(answers)) {
        await quizApi.saveAnswer(attempt.id, Number(questionId), value.trim())
      }

      return quizApi.submitAttempt(attempt.id)
    },

    onSuccess: (data) => {
      setResult(data)
    },

    onError: (error) => {
      setErrorMessage((error as Error).message)
    },
  })

  return (
    <div>
      <h2>Quiz Player</h2>
      <p>Enter a quiz ID to start an attempt.</p>

      {errorMessage && <p className='error'>{errorMessage}</p>}

      {!attempt && (
        <div className='card'>
          <label>
            Quiz ID
            <input
              placeholder='Enter quiz ID'
              value={quizId}
              onChange={(event) => setQuizId(event.target.value)}
            />
          </label>

          <button
            type='button'
            onClick={() => loadQuizMutation.mutate()}
            disabled={loadQuizMutation.isPending}
          >
            {loadQuizMutation.isPending ? 'Loading...' : 'Load Quiz'}
          </button>
        </div>
      )}

      {attempt && (
        <>
          <div className='card'>
            <h3>{attempt.quiz.title}</h3>
            <p>{attempt.quiz.description}</p>
            <p>{totalQuestions} questions loaded</p>
          </div>

          {currentQuestion && !result && (
            <div className='card'>
              <p>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>

              <h4>{currentQuestion.prompt}</h4>

              {currentQuestion.type === 'mcq' &&
                currentQuestion.options?.map((option, optionIndex) => (
                  <label key={optionIndex} style={{ display: 'block' }}>
                    <input
                      type='radio'
                      name={`question-${currentQuestion.id}`}
                      value={String(optionIndex)}
                      checked={answers[currentQuestion.id] === String(optionIndex)}
                      onChange={(event) =>
                        updateAnswer(currentQuestion.id, event.target.value)
                      }
                    />
                    {option}
                  </label>
                ))}

              {currentQuestion.type === 'short' && (
                <label>
                  Your Answer
                  <input
                    placeholder='Type your answer'
                    value={answers[currentQuestion.id] || ''}
                    onPaste={() => antiCheat.recordPaste(currentQuestion.id)}
                    onChange={(event) =>
                      updateAnswer(currentQuestion.id, event.target.value)
                    }
                  />
                </label>
              )}

              <div>
                <button
                  type='button'
                  disabled={isFirstQuestion}
                  onClick={() => setCurrentQuestionIndex((current) => current - 1)}
                >
                  Previous
                </button>

                <button
                  type='button'
                  disabled={isLastQuestion}
                  onClick={() => setCurrentQuestionIndex((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {!result && (
            <button
              type='button'
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}

          {result && (
            <div className='card'>
              <h3>
                Score: {result.score}/{totalQuestions}
                {scorePercent !== null ? ` (${scorePercent}%)` : ''}
              </h3>

              {result.details.map((detail, index) => (
                <p key={detail.questionId}>
                  Question {index + 1}:{' '}
                  <strong>{detail.correct ? 'Correct' : 'Incorrect'}</strong>
                  {detail.expected && !detail.correct
                    ? ` — Expected: ${detail.expected}`
                    : ''}
                </p>
              ))}

              <h4>Anti-Cheat Summary</h4>
              <p>Tab switches: {antiCheat.summary.tabSwitches}</p>
              <p>Paste actions: {antiCheat.summary.pasteActions}</p>

              <button
                type='button'
                onClick={() => {
                  setAttempt(null)
                  setAnswers({})
                  setResult(null)
                  setQuizId('')
                  setErrorMessage('')
                  setCurrentQuestionIndex(0)
                  antiCheat.resetSummary()
                }}
              >
                Take Another Quiz
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
