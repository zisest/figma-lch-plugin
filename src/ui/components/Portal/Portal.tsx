import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom'

import './Portal.css'

type PropTypes = {
  children: ReactNode
}

function Portal ({ children }: PropTypes) {
  const [container] = React.useState(document.createElement('div'))

  container.classList.add('portal')

  React.useEffect(() => {
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [])

  return ReactDOM.createPortal(children, container)
}

export default Portal