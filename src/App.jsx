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
      position: [0, 0, 5],
      fov: 40 }}  
    >
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <Particles position = {[1.5, 0, 0]} />
      <OrbitControls />
    </Canvas>
  </>
  )
}

export default App
