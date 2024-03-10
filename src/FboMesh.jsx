
import { DoubleSide, Scene, OrthographicCamera, FloatType } from 'three'
import { useRef } from 'react'
import { useFrame, createPortal } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

import './RenderMaterial'
import './SimulationMaterial'


const SIZE = 32;



export function FboMesh(){

let time = 0

const simMat = useRef()
const renderMat = useRef()
const debugPlane = useRef()

const scene = new Scene()
const camera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)

let heightmap0 = useFBO( SIZE, SIZE, {
  type: FloatType
})

let heightmap1 = useFBO( SIZE, SIZE, {
  type: FloatType
})

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

  console.log(heightmap1)

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

      <mesh>
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