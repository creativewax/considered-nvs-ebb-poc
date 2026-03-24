// src/pages/ResultsPage.jsx

import { useParams } from 'react-router-dom'

export default function ResultsPage() {
  const { id } = useParams()

  return (
    <div className="page">
      <div className="page-content">
        <h1>Results: {id}</h1>
      </div>
    </div>
  )
}
