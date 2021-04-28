import clsx from 'clsx'
import React, { ChangeEventHandler, FocusEventHandler, useRef } from 'react'
import Icon from '../Icon'

import './TextInput.css'

type PropTypes = {
  value: (string|number),
  onChange?: ChangeEventHandler<HTMLInputElement>,
  name?: string,
  onBlur?: Function,
  withCopyBtn?: boolean
}

function TextInput ({ value, onChange, name, onBlur, withCopyBtn }: PropTypes) {
  const textInput = useRef(null)
  
  function blurOnEnter (e) {    
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
      onBlur?.(e)
    }
  }

  function selectOnClick (e) {
    (e.target as HTMLInputElement).select()
  }

  function copyToClipboard () {
    let el = textInput.current
    el.select()
    document.execCommand('copy')
  }

  return (
    <div className={clsx('input', withCopyBtn && 'input--with-button')}>
      <input 
        type="text" className="input__field" value={value} 
        onChange={onChange} name={name} onBlur={onBlur as FocusEventHandler} 
        onKeyDown={blurOnEnter}
        onFocus={selectOnClick} ref={textInput}
      />
      {withCopyBtn && <Icon iconName='copy' onClick={copyToClipboard} />}
    </div>
  )
}

export default TextInput