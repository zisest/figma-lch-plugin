import React from 'react'

import './Checkbox.css'

type PropTypes = {
  checked: boolean,
  onChange: (v: boolean) => void,
  id: string,
  label: string
}

function Checkbox ({ checked, onChange, id, label }: PropTypes) {
  return (
    <div className="checkbox">
      <input className="checkbox__box" id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <label className="checkbox__label" htmlFor={id}>{label}</label>
    </div>
  )
}

export default Checkbox