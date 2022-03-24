import clsx from 'clsx'
import React, { ChangeEventHandler, FocusEventHandler, useRef, FocusEvent, KeyboardEvent } from 'react'
import Icon from '../Icon'

import './TextInput.css'

type PropTypes = {
  value: string | number,
  onChange?: ChangeEventHandler<HTMLInputElement>,
  name: string,
  onBlur?: FocusEventHandler<HTMLInputElement>,
  withCopyBtn?: boolean,
  disabled?: boolean
}

function TextInput ({ value, onChange, name, onBlur, withCopyBtn, disabled }: PropTypes) {
  const textInput = useRef<HTMLInputElement>(null)
  
  function blurOnEnter (e: KeyboardEvent<HTMLInputElement>) {    
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  function selectOnClick (e: FocusEvent<HTMLInputElement>) {
    e.target.select()
  }

  function copyToClipboard () {
    if ('clipboard' in window.navigator) { 
      // is not supported in Figma as of now
      window.navigator.clipboard.writeText(value.toString())
    } else {
      const el = textInput.current
      if (!el) return
      el.select()
      document.execCommand('copy')
    }   
  }

  return (
    <div className={clsx('input', withCopyBtn && 'input--with-button')}>
      <input disabled={disabled}
        type="text" className="input__field" value={value} 
        onChange={onChange} name={name} aria-label={name}
        onKeyDown={blurOnEnter} onBlur={onBlur}  
        onFocus={selectOnClick} ref={textInput}
      />
      {withCopyBtn && <Icon iconName='copy' onClick={copyToClipboard} />}
    </div>
  )
}

export default TextInput