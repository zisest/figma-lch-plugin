import React, { ChangeEventHandler, FocusEventHandler } from 'react'

import './TextInput.css'

type PropTypes = {
  value: (string|number),
  onChange?: ChangeEventHandler<HTMLInputElement>,
  name?: string,
  onBlur?: Function
}

function TextInput ({ value, onChange, name, onBlur }: PropTypes) {
  
  function blurOnEnter (e) {    
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
      onBlur?.(e)
    }
  }

  return (
    <div className="input">
      <input 
        type="text" className="input__field" value={value} 
        onChange={onChange} name={name} onBlur={onBlur as FocusEventHandler} 
        onKeyDown={blurOnEnter}
      />
    </div>
  )
}

export default TextInput