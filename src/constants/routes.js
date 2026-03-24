// src/constants/routes.js

export const ROUTES = {
  SPLASH:  '/splash',
  HOME:    '/',
  RESULTS: '/results/:id',
  HISTORY: '/history',
  HEALTH:  '/health',
  PROFILE: '/profile',
}

export const buildResultsPath = (id) => `/results/${id}`
