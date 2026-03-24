// src/components/home/ArticleCards.jsx

import { BookOpen } from 'lucide-react'
import styles from './ArticleCards.module.css'

// ------------------------------------------------------------ ARTICLES DATA

const ARTICLES = [
  {
    title: 'Understanding CSU and Sleep',
    description: 'How chronic urticaria affects your sleep cycles and what you can do about it.',
    tag: 'CSU Basics',
    colour: 'var(--colour-poor-deep)',
  },
  {
    title: 'The Role of Antihistamines',
    description: 'Timing your medication for better sleep quality and fewer night-time flare-ups.',
    tag: 'Treatment',
    colour: 'var(--colour-good)',
  },
  {
    title: 'Stress, Hives & Rest',
    description: 'Breaking the cycle between stress-triggered hives and disrupted sleep.',
    tag: 'Wellness',
    colour: 'var(--colour-accent)',
  },
]

// ------------------------------------------------------------ ARTICLE CARDS

export default function ArticleCards() {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>
        <BookOpen size={14} />
        Articles
      </h2>

      <div className={styles.list}>
        {ARTICLES.map((article) => (
          <div
            key={article.title}
            className={styles.card}
            style={{ borderLeftColor: article.colour }}
          >
            <span className={styles.tag} style={{ color: article.colour }}>
              {article.tag}
            </span>
            <h3 className={styles.title}>{article.title}</h3>
            <p className={styles.description}>{article.description}</p>
            <span className={styles.readMore}>Read more &rarr;</span>
          </div>
        ))}
      </div>
    </div>
  )
}
