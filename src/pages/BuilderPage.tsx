import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { quizApi } from '../api/quizzes'

type Question = {
  type: 'mcq' | 'short'
  prompt: string
  options: string[]
  correctAnswer: string
}

export default function BuilderPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [savedQuizId, setSavedQuizId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const addMcqQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        type: 'mcq',
        prompt: '',
        options: ['', ''],
        correctAnswer: '',
      },
    ])
  }

  const addShortQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        type: 'short',
        prompt: '',
        options: [],
        correctAnswer: '',
      },
    ])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...updates } : question
      )
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? value : option
          ),
        }
      })
    )
  }

  const addOption = (questionIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? { ...question, options: [...question.options, ''] }
          : question
      )
    )
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question

        const nextOptions = question.options.filter(
          (_, currentOptionIndex) => currentOptionIndex !== optionIndex
        )

        return {
          ...question,
          options: nextOptions,
          correctAnswer:
            question.correctAnswer === String(optionIndex) ? '' : question.correctAnswer,
        }
      })
    )
  }

  const removeQuestion = (questionIndex: number) => {
    setQuestions((current) => current.filter((_, index) => index !== questionIndex))
  }

  const createQuizMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage('')
      setSavedQuizId(null)

      if (!title.trim()) {
        throw new Error('Quiz title required')
      }

      if (!description.trim()) {
        throw new Error('Quiz description required')
      }

      if (questions.length === 0) {
        throw new Error('At least one question required')
      }

      for (const question of questions) {
        if (!question.prompt.trim()) {
          throw new Error('Every question needs a prompt')
        }

        if (!question.correctAnswer.trim()) {
          throw new Error('Every question needs a correct answer')
        }

        if (question.type === 'mcq' && question.options.length < 2) {
          throw new Error('Every MCQ question needs at least two options')
        }

        if (
          question.type === 'mcq' &&
          question.options.some((option) => !option.trim())
        ) {
          throw new Error('Every MCQ option must be filled')
        }
      }

      const quiz = await quizApi.createQuiz({
        title: title.trim(),
        description: description.trim(),
        isPublished: true,
      })

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]

        await quizApi.createQuestion(quiz.id, {
          ...question,
          prompt: question.prompt.trim(),
          correctAnswer: question.correctAnswer.trim(),
          options: question.options.map((option) => option.trim()),
          position: i,
        })
      }

      return quiz
    },

    onSuccess: (quiz) => {
      setSavedQuizId(quiz.id)
      setTitle('')
      setDescription('')
      setQuestions([])
    },

    onError: (error) => {
      setErrorMessage((error as Error).message)
    },
  })

  return (
    <div>
      <h2>Quiz Builder</h2>
      <p>Create a coding-related quiz with multiple choice and short answer questions.</p>

      {errorMessage && <p className='error'>{errorMessage}</p>}

      {savedQuizId && (
        <p className='success'>
          Quiz saved successfully. Quiz ID: <strong>{savedQuizId}</strong>
        </p>
      )}

      <div className='card'>
        <label>
          Quiz Title
          <input
            placeholder='JavaScript Basics'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label>
          Quiz Description
          <textarea
            placeholder='A short quiz about JavaScript fundamentals.'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
      </div>

      <div className='builder-actions'>
        <button type='button' onClick={addMcqQuestion}>
          Add Multiple Choice
        </button>

        <button type='button' onClick={addShortQuestion}>
          Add Short Answer
        </button>
      </div>

      {questions.map((question, index) => (
        <div key={index} className='card question-card'>
          <div className='question-card-header'>
            <div>
              <h3>Question {index + 1}</h3>
              <span className='question-type'>
                {question.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
              </span>
            </div>

            <button
              type='button'
              className='danger-button'
              onClick={() => removeQuestion(index)}
            >
              Remove Question
            </button>
          </div>

          <label>
            Prompt
            <textarea
              placeholder='Enter the question prompt'
              value={question.prompt}
              onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
            />
          </label>

          {question.type === 'mcq' && (
            <div>
              <h4>Choices</h4>

              <div className='options-list'>
                {question.options.map((option, optionIndex) => {
                  const isCorrect = question.correctAnswer === String(optionIndex)

                  return (
                    <div
                      key={optionIndex}
                      className={
                        isCorrect ? 'option-row option-row-selected' : 'option-row'
                      }
                    >
                      <input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(event) =>
                          updateOption(index, optionIndex, event.target.value)
                        }
                      />

                      <label className='correct-option'>
                        <input
                          type='radio'
                          name={`correct-${index}`}
                          checked={isCorrect}
                          onChange={() =>
                            updateQuestion(index, {
                              correctAnswer: String(optionIndex),
                            })
                          }
                        />
                        Correct
                      </label>

                      {question.options.length > 2 && (
                        <button
                          type='button'
                          className='secondary-button'
                          onClick={() => removeOption(index, optionIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <button type='button' onClick={() => addOption(index)}>
                Add Choice
              </button>
            </div>
          )}

          {question.type === 'short' && (
            <label>
              Correct Answer
              <input
                placeholder='Expected answer'
                value={question.correctAnswer}
                onChange={(event) =>
                  updateQuestion(index, {
                    correctAnswer: event.target.value,
                  })
                }
              />
            </label>
          )}
        </div>
      ))}

      <button
        type='button'
        onClick={() => createQuizMutation.mutate()}
        disabled={createQuizMutation.isPending}
      >
        {createQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
      </button>
    </div>
  )
}
