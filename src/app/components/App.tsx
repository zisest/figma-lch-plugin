import React, { useState, useEffect } from 'react'

import '../styles/ui.css'

declare function require(path: string): any;

const App = ({}) => {
  const [count, setCount] = useState(5)

  const onCreate = () => {
    parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
  }

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }

  useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage
      if (type === 'create-rectangles') {
        console.log(`Figma Says: ${message}`)
      }
    }
  }, [])

  return (
    <div>
      <h2>Rectangle Creator</h2>
      <img src={require('../assets/logo.svg')} alt="ff" />
      <p>
        Count: <input value={count} onChange={(e) => setCount(Number(e.target.value))} />
      </p>
      <button onClick={onCreate}>Create</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}

export default App
