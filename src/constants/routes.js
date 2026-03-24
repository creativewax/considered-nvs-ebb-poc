// src/constants/routes.js

export const ROUTES = {
  HOME:    '/',
  RESULTS: '/results/:id',
  HISTORY: '/history',
  PROFILE: '/profile',
}

export const buildResultsPath = (id) => `/results/${id}`
