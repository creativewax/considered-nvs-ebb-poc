// src/components/common/PageLoader.jsx

import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.wrap}>
      <span className={`${styles.dot} sync-spinner`} />
    </div>
  )
}
