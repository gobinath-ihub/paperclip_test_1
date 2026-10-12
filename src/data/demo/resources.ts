/* ============================================================
   Demo Learning Resources
   ============================================================ */

import type { ResourcesResponse } from '../../types/api';

export const demoResources: ResourcesResponse = {
  resources: [
    {
      id: 'res-demo-1',
      title: 'Solving Linear Equations — Step by Step',
      type: 'video',
      source: 'Khan Academy',
      url: 'https://www.khanacademy.org/math/algebra/solving-linear-equations',
      description: 'A complete walkthrough of solving one-step and two-step linear equations with visual explanations.',
      topic: 'Linear Equations',
      difficulty: 'Grade 9',
      reason: 'Foundational video for understanding inverse operations.',
    },
    {
      id: 'res-demo-2',
      title: 'Algebra Fundamentals — Chapter 3: Equations',
      type: 'book',
      source: 'OpenStax',
      url: 'https://openstax.org/books/elementary-algebra-2e/pages/3-1',
      description: 'Free textbook chapter covering equation solving with detailed worked examples.',
      topic: 'Algebra',
      difficulty: 'Grade 9-10',
      reason: 'Excellent reference material for equation solving techniques.',
    },
    {
      id: 'res-demo-3',
      title: 'Common Mistakes in Algebra',
      type: 'article',
      source: 'MathIsFun',
      url: 'https://www.mathsisfun.com/algebra/solving-equations.html',
      description: 'Interactive guide highlighting the most common algebraic mistakes students make.',
      topic: 'Algebra',
      difficulty: 'Grade 8-10',
      reason: 'Helps identify and correct common algebraic mistakes.',
    },
    {
      id: 'res-demo-4',
      title: 'Linear Equations Practice — 20 Problems',
      type: 'practice',
      source: 'Loop Learning Practice Engine',
      description: 'Curated set of 20 two-step linear equation problems with increasing difficulty.',
      topic: 'Linear Equations',
      difficulty: 'Grade 9',
      reason: 'Targeted practice for building fluency with equation solving.',
    },
    {
      id: 'res-demo-5',
      title: 'Understanding Inverse Operations',
      type: 'video',
      source: '3Blue1Brown',
      url: 'https://www.youtube.com/watch?v=example',
      description: 'Beautiful visual explanation of why inverse operations work in algebra.',
      topic: 'Inverse Operations',
      difficulty: 'Grade 8-10',
      reason: 'Deep conceptual understanding of the mechanics behind equation solving.',
    },
    {
      id: 'res-demo-6',
      title: 'Quadratic Equations — Introduction',
      type: 'video',
      source: 'Khan Academy',
      url: 'https://www.khanacademy.org/math/algebra/quadratic-equations',
      description: 'Introduction to quadratic equations and the quadratic formula.',
      topic: 'Quadratic Equations',
      difficulty: 'Grade 10',
      reason: 'Next topic after mastering linear equations.',
    },
  ],
  total: 6,
};
