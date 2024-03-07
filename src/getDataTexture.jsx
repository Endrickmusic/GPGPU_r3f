import { DataTexture, RGBAFormat, FloatType } from 'three'

export function getDataTexture(size){

            // Create data texture

            let number = size * size
            const data = new Float32Array( 4 * number )
            for ( let i = 0; i < size; i ++) {
                for ( let j = 0; j < size; j ++) {
                    const index = i * size + j
                
                // Generate points on sphere
    
                    let theta = Math.random() * Math.PI * 2
                    let phi = Math.acos(Math.random() * 2 - 1)
                    let x = Math.sin(phi) * Math.cos(theta)
                    let y = Math.sin(phi) * Math.sin(theta)
                    let z = Math.cos(phi)
    
                    data[ 4 * index + 0 ] = x
                    data[ 4 * index + 1 ] = y
                    data[ 4 * index + 2 ] = z
                    data[ 4 * index + 3 ] = (Math.random() - 0.5) * 0.01
                   }
            }
           
            let dataTexture = new DataTexture( 
                data,
                size, 
                size, 
                RGBAFormat,
                FloatType,     
                ) 
            
            dataTexture.needsUpdate = true
        
            return dataTexture
}