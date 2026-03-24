// src/components/home/ArticleCards.jsx

import styles from './ArticleCards.module.css'

// ------------------------------------------------------------ ARTICLES DATA

const ARTICLES = [
  {
    title: 'Understanding CSU and Sleep',
    description: 'How chronic urticaria affects your sleep cycles and what you can do about it.',
  },
  {
    title: 'The Role of Antihistamines',
    description: 'Timing your medication for better sleep quality and fewer night-time flare-ups.',
  },
  {
    title: 'Stress, Hives & Rest',
    description: 'Breaking the cycle between stress-triggered hives and disrupted sleep.',
  },
]

// ------------------------------------------------------------ ARTICLE CARDS

export default function ArticleCards() {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Articles</h2>

      <div className={styles.list}>
        {ARTICLES.map((article) => (
          <div key={article.title} className={styles.card}>
            <h3 className={styles.title}>{article.title}</h3>
            <p className={styles.description}>{article.description}</p>
            <span className={styles.readMore}>Read more &rarr;</span>
          </div>
        ))}
      </div>
    </div>
  )
}
