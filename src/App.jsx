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
      position: [0, 0, 2],
      fov: 40 }}  
    >
      <ambientLight 
      intensity = {0.5}
      />
      <directionalLight />
      <Particles />
      <OrbitControls />
    </Canvas>
  </>
  )
}

export default App
