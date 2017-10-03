import React from 'react';

export default ({children, ...childProps}) => {
  return <span onClick={selectAll} {...childProps}>{children}</span>
}

const selectAll = e => {
  const element = e.target
  // console.log('e', e); e.persist()
  const selection = window.getSelection()
  const range = document.createRange()
  
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
  
  // document.execCommand('copy') // 
}