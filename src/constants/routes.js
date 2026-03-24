// src/constants/routes.js

export const ROUTES = {
  SPLASH:  '/',
  HOME:    '/home',
  RESULTS: '/results/:id',
  HISTORY: '/history',
  HEALTH:  '/health',
  PROFILE: '/profile',
}

export const buildResultsPath = (id) => `/results/${id}`
