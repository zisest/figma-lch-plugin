import React, { ChangeEventHandler } from 'react'

import './Checkbox.css'

type PropTypes = {
  checked: boolean,
  onChange: ChangeEventHandler<HTMLInputElement>,
  id: string,
  label: string
}

function Checkbox ({ checked, onChange, id, label }: PropTypes) {
  return (
    <div className="checkbox">
      <input className="checkbox__box" id={id} type="checkbox" checked={checked} onChange={onChange} />
      <label className="checkbox__label" htmlFor={id}>{label}</label>
    </div>
  )
}

export default Checkbox