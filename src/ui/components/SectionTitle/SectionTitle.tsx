import React, { ReactNode } from 'react'

import './SectionTitle.css'

type PropTypes = {
  children: ReactNode
}

function SectionTitle ({ children }: PropTypes) {

  return (
    <div className="section-title">{children}</div>
  )
}

export default SectionTitle