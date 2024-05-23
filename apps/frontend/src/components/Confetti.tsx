import { useWindowSize } from '@/hooks/useWindowSize'
import React from 'react'
import Confetti from 'react-confetti'

export default () => {
  const { width, height } = useWindowSize()
  return (
    <div className='fixed left-0 top-0 z-[1]'>
        <Confetti
          width={width}
          height={height}
          wind={0.02}
          gravity={0.1}
        />
    </div>
  )
}