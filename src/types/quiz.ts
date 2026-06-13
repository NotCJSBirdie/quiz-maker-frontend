export type QuestionType = 'mcq' | 'short' | 'code'

export type Quiz = {
  id: number
  title: string
  description: string
  timeLimitSeconds?: number
  isPublished?: boolean
  createdAt?: string
  questions?: Question[]
}

export type Question = {
  id: number
  quizId: number
  type: QuestionType
  prompt: string
  options?: string[]
  correctAnswer?: string | number
  position: number
}

export type CreateQuizPayload = {
  title: string
  description: string
  timeLimitSeconds?: number
  isPublished: boolean
}

export type CreateQuestionPayload =
  | {
      type: 'mcq'
      prompt: string
      options: string[]
      correctAnswer: string
      position: number
    }
  | {
      type: 'short'
      prompt: string
      correctAnswer: string
      position: number
    }

export type Attempt = {
  id: number
  quizId: number
  startedAt: string
  submittedAt: string | null
  answers: Array<{ questionId: number; value: string }>
  quiz: {
    id: number
    title: string
    description: string
    timeLimitSeconds?: number
    questions: Question[]
  }
}

export type SubmitResult = {
  score: number
  details: Array<{
    questionId: number
    correct: boolean
    expected?: string
  }>
}

export type AttemptQuestion = {
  id: number
  type: 'mcq' | 'short'
  prompt: string
  options?: string[]
  position: number
}

export type StartAttemptResponse = {
  id: number
  quizId: number
  startedAt: string
  quiz: {
    id: number
    title: string
    description: string
    questions: AttemptQuestion[]
  }
}
