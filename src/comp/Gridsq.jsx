import React from 'react'

const Gridsq = ({children,dark}) => {
  const colour=dark?'square-dark':'square-light'
  return (
    <div className={`${colour} fret`}>
      {children}
    </div>
  )
}

export default Gridsq
