/* ============================================================
   Demo Feedback Responses
   Only used when backend is unreachable.
   ============================================================ */

import type { FeedbackResponse } from '../../types/api';

export const demoFeedbackIncorrect: FeedbackResponse = {
  verdict: 'incorrect',
  misconceptionType: 'invalid_inverse_operation',
  confidence: 0.95,
  feedbackLevel: 2,
  feedback:
    "Let's fix one step. You added 5 instead of subtracting 5 when moving the term to the other side.",
  explanation:
    'When we have 2x + 5 = 15, we need to subtract 5 from both sides (the inverse of adding 5):\n\n2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5',
  workedExample:
    'Step 1: Start with the equation\n2x + 5 = 15\n\nStep 2: Subtract 5 from both sides (inverse operation)\n2x + 5 - 5 = 15 - 5\n2x = 10\n\nStep 3: Divide both sides by 2\n2x ÷ 2 = 10 ÷ 2\nx = 5\n\nStep 4: Verify\n2(5) + 5 = 10 + 5 = 15 ✓',
  retryQuestion: 'Solve 4x + 6 = 22',
  resources: [
    {
      id: 'res-1',
      title: 'Solving Linear Equations - Khan Academy',
      type: 'video',
      source: 'Khan Academy',
      url: 'https://www.khanacademy.org/math/algebra/solving-linear-equations',
      description: 'Complete guide to solving one-step and two-step linear equations.',
      topic: 'Linear Equations',
      difficulty: 'Grade 9',
      reason: 'Covers the exact inverse operation concept you need to review.',
    },
    {
      id: 'res-2',
      title: 'Algebra Fundamentals - Chapter 3',
      type: 'book',
      source: 'OpenStax',
      url: 'https://openstax.org/books/elementary-algebra-2e/pages/3-1-solving-linear-equations',
      description: 'Comprehensive textbook chapter on solving equations with worked examples.',
      topic: 'Linear Equations',
      difficulty: 'Grade 9-10',
      reason: 'Provides additional worked examples of inverse operations.',
    },
    {
      id: 'res-3',
      title: 'Common Algebra Mistakes and How to Avoid Them',
      type: 'article',
      source: 'MathIsFun',
      url: 'https://www.mathsisfun.com/algebra/solving-equations.html',
      description: 'Interactive guide showing common mistakes when solving equations.',
      topic: 'Algebra',
      difficulty: 'Grade 8-10',
      reason: 'Specifically addresses the inverse operation mistakes you made.',
    },
    {
      id: 'res-4',
      title: 'Linear Equations Practice Set',
      type: 'practice',
      source: 'Loop Learning',
      description: '10 practice problems focused on two-step linear equations.',
      topic: 'Linear Equations',
      difficulty: 'Grade 9',
      reason: 'Targeted practice to build confidence with inverse operations.',
    },
  ],
};

export const demoFeedbackCorrect: FeedbackResponse = {
  verdict: 'correct',
  confidence: 0.98,
  feedbackLevel: 1,
  feedback: 'Excellent work! You correctly solved the equation using proper inverse operations.',
  explanation:
    'Your working shows a clear understanding of the steps:\n1. Subtract the constant from both sides\n2. Divide by the coefficient\n\nThis is exactly the right approach!',
};

export const demoFeedbackPartial: FeedbackResponse = {
  verdict: 'incorrect',
  misconceptionType: 'arithmetic_subtraction_error',
  confidence: 0.88,
  feedbackLevel: 1,
  feedback:
    'Your algebraic method is correct, but there is a small arithmetic error in your calculation.',
  explanation:
    'You correctly identified that you need to subtract 4 from both sides of 6x + 4 = 22.\nHowever, 22 - 4 = 18, not 16.\n\n6x + 4 = 22\n6x = 22 - 4\n6x = 18\nx = 3',
  workedExample:
    'Step 1: 6x + 4 = 22\nStep 2: 6x = 22 - 4 = 18\nStep 3: x = 18 ÷ 6 = 3\nVerify: 6(3) + 4 = 18 + 4 = 22 ✓',
  retryQuestion: 'Solve 5x + 3 = 28',
};
