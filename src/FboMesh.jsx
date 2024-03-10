
import { DoubleSide, Scene, OrthographicCamera, FloatType, Vector2 } from 'three'
import { useRef, useState } from 'react'
import { useFrame, createPortal, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

import './RenderMaterial'
import './SimulationMaterial'


const SIZE = 256

const BOUNDS = 512

export function FboMesh(){

let time = 0

const { viewport } = useThree();

const simMat = useRef()
const renderMat = useRef()
const debugPlane = useRef()

const scene = new Scene()
const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)

// Defines
// simMat.current.defines.SIZE = SIZE.toFixed( 1 )
// simMat.current.defines.BOUNDS = BOUNDS.toFixed( 1 )

console.log(simMat.current)

let heightmap0 = useFBO( SIZE, SIZE, {
  type: FloatType
})

let heightmap1 = useFBO( SIZE, SIZE, {
  type: FloatType
})

const handlePointerMove = (event) => {
  // const x = (event.point.x / viewport.width) * 2 - 1
  const x = event.point.x
  // const y = -(event.point.y / viewport.height) * 2 + 1
  const y = - event.point.y 
  simMat.current.uniforms.uMouse.value.x = (x * viewport.width) * 20  
  simMat.current.uniforms.uMouse.value.y = (y * viewport.height) * 25
  console.log(simMat.current.uniforms.uMouse.value)
}

useFrame(( {gl} ) =>{

  time += 0.02

  gl.setRenderTarget(heightmap0)
  gl.render( scene, camera )
  gl.setRenderTarget(null)

  renderMat.current.uniforms.uPosition.value = heightmap1.texture
  simMat.current.uniforms.uPosition.value = heightmap0.texture
  
  renderMat.current.uniforms.uTime.value = time
  simMat.current.uniforms.uTime.value = time

  let temp = heightmap0
  heightmap0 = heightmap1
  heightmap1 = temp

})

  return(
      <>
    {createPortal(
      <mesh>
        <planeGeometry args={[2, 2]}/>
        <simulationMaterial 
        ref = { simMat } 
        />
      </mesh>,
      scene
    )}

      <mesh
      onPointerMove={ handlePointerMove }
      >
        <planeGeometry  
        args={[3, 3, SIZE, SIZE]} />
        <renderMaterial 
        ref = { renderMat }
        side={ DoubleSide }
        wireframe = { true }
        />
      </mesh>
      
      <mesh
      ref = {debugPlane}
      position = {[2.5, 0, 0]}
      >
        <planeGeometry />
        <meshStandardMaterial
        map={ heightmap1.texture }
        />
      </mesh>
    </>
    )
}