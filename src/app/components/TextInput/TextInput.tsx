import React, { ChangeEventHandler } from 'react'

import './TextInput.css'

type PropTypes = {
  value: (string|number),
  onChange: ChangeEventHandler<HTMLInputElement>,
  name?: string
}

function TextInput ({ value, onChange, name }: PropTypes) {
  return (
    <div className="input">
      <input type="text" className="input__field" value={value} onChange={onChange} name={name} />
    </div>
  )
}

export default TextInput