import { api } from './client'
import type {
  Quiz,
  CreateQuizPayload,
  CreateQuestionPayload,
  SubmitResult,
  StartAttemptResponse,
} from '../types/quiz'

export const quizApi = {
  listQuizzes: () => api<Quiz[]>('/quizzes'),

  getQuiz: (id: number) => api<Quiz>(`/quizzes/${id}`),

  createQuiz: (payload: CreateQuizPayload) =>
    api<Quiz>('/quizzes', {
      method: 'POST',
      body: payload,
    }),

  createQuestion: (quizId: number, payload: CreateQuestionPayload) =>
    api(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: payload,
    }),

  startAttempt: (quizId: number) =>
    api<StartAttemptResponse>('/attempts', {
      method: 'POST',
      body: { quizId },
    }),

  saveAnswer: (attemptId: number, questionId: number, value: string) =>
    api(`/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: {
        questionId,
        value,
      },
    }),

  submitAttempt: (attemptId: number) =>
    api<SubmitResult>(`/attempts/${attemptId}/submit`, {
      method: 'POST',
    }),

  recordEvent: (attemptId: number, event: string) =>
    api(`/attempts/${attemptId}/events`, {
      method: 'POST',
      body: { event },
    }),
}
