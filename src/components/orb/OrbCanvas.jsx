// src/components/orb/OrbCanvas.jsx

import { useRef, useEffect, useState } from 'react'
import { OrbScene } from '../../lib/three/OrbScene'
import { OrbFallback } from './OrbFallback'
import styles from './OrbCanvas.module.css'

// ------------------------------------------------------------
// WEBGL DETECTION
// ------------------------------------------------------------

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

// ------------------------------------------------------------
// ORB CANVAS — React wrapper mounting OrbScene
// ------------------------------------------------------------

export function OrbCanvas({ config, quality }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const [webgl] = useState(hasWebGL)

  // Mount / unmount the Three.js scene
  useEffect(() => {
    if (!webgl || !containerRef.current) return

    const scene = new OrbScene()
    scene.mount(containerRef.current)
    sceneRef.current = scene

    return () => {
      scene.unmount()
      sceneRef.current = null
    }
  }, [webgl])

  // Resize observer
  useEffect(() => {
    if (!webgl || !containerRef.current || !sceneRef.current) return

    const observer = new ResizeObserver(() => {
      sceneRef.current?.resize()
    })
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [webgl])

  // Push config updates to the scene
  useEffect(() => {
    if (config && sceneRef.current) {
      sceneRef.current.updateConfig(config)
    }
  }, [config])

  if (!webgl) {
    return (
      <div className={styles.container}>
        <OrbFallback quality={quality} />
      </div>
    )
  }

  return <div ref={containerRef} className={styles.container} />
}
