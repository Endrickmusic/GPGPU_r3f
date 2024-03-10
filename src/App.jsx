import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import './index.css'
import { Particles } from './Particles.jsx'


function App() {
  
  return (
  <>

    <Canvas
    camera={{ 
      position: [0, 0, 3],
      fov: 40 }}  
    >
      <Particles />
      <OrbitControls />
    </Canvas>
  </>
  )
}

export default App
