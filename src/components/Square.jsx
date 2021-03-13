import React from 'react'

import classnames from 'classnames';

import { EMPTY } from '../core/game';
import './Square.css'


const Square = ({ value, clickable, onClick = () => { } }) => {
  let classes = ['square'];
  clickable ? classes.push('clickable') : classes.push('unclickable');

  return (
    <button 
      className={classnames(classes)} 
      onClick={() => {
        if (clickable) {
          onClick();
        }
      }}
    >
      {value !== EMPTY ? value : ' '}
    </button>
  )
}

export default Square;
