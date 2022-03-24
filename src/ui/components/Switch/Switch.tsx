import c from 'clsx'
import React, { ChangeEvent } from 'react'

import './Switch.css'

type PropTypes = {
  selected: string,
  onChange: (value: string) => void,
  id: string,
  name: string,
  values: [string, string]
}

// radio button based 2-value switch
// not using a checkbox for better a11y and 2 clickable labels
function Switch ({ selected, onChange, name, values }: PropTypes) {
  if (values[0] === values[1]) throw new Error('Toggle switch values should be different')

  function handleChange (e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  function toggleValue () {
    const newValue = ({
      [values[0]]: values[1],
      [values[1]]: values[0]
    })[selected]

    onChange(newValue)
  }

  const id1 = name + '-' + values[0]
  const id2 = name + '-' + values[1]

  return (
    <div className={c('switch', selected === values[1] && 'switch_checked')}>
      <label htmlFor={id1}>{values[0]}</label>
      <input type="radio" name={name} value={values[0]} id={id1} onChange={handleChange} checked={selected === values[0]} />
      <input type="radio" name={name} value={values[1]} id={id2} onChange={handleChange} checked={selected === values[1]} />
      <span aria-hidden="true" onClick={toggleValue}></span>
      <label htmlFor={id2}>{values[1]}</label>
    </div>
  )
}

export default Switch
