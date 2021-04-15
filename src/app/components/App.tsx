import React, { useState, useEffect } from 'react'

import '../styles/ui.css'

declare function require(path: string): any;

// Load images
// const Img = require('../assets/logo.svg')

// example usage
// parent.postMessage({ pluginMessage: { type: 'create-rectangles', data } }, '*')

const App = ({}) => {
  const [RGBA, setRGBA] = useState([0, 0, 0, 1]) // every value is from 0 to 1
  const [LCHA, setLCHA] = useState([0, 0, 0, 1])


  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
  }
  const onCheck = () => {
    parent.postMessage({ pluginMessage: { type: 'check' } }, '*')
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
      
      <button onClick={onCheck}>Check</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}

export default App
