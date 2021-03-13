import React from 'react'

import classnames from 'classnames';

import { EMPTY } from '../core/game';
import './Square.css'


const Square = ({ value, clickable, evaluateScore, onClick = () => { } }) => {
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
      <div style={{ position: "relative", height: "100%" }}>
        <span>{value !== EMPTY ? value : ' '}</span>
        {(evaluateScore !== null && value === EMPTY) ? (
          <span style={{ position: "absolute", left: "6px", bottom: "2px", fontSize: "10px", lineHeight: "10px", fontWeight: "bold" }}>
            {Number(evaluateScore).toFixed(4)}
          </span>
        ) : ''}
      </div>
    </button>
  )
}

export default Square;
