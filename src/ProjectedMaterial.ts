import * as THREE from 'three'


interface ProjectedMaterialParams {
  camera: THREE.PerspectiveCamera;
  texture: THREE.Texture;
  color: number;
  options?: any;
}


export default class ProjectedMaterial extends THREE.ShaderMaterial {
  isProjectedMaterial: boolean;

  constructor({ camera, texture, color = 0xffffff, ...options } : ProjectedMaterialParams ) {
    if (!texture || !texture.isTexture) {
      throw new Error('Invalid texture passed to the ProjectedMaterial');
    }

    if (!camera || !camera.isCamera) {
      throw new Error('Invalid camera passed to the ProjectedMaterial');
    }

    // make sure the camera matrices are updated
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.updateWorldMatrix(true, false);

    // get the matrices from the camera so they're fixed in camera's original position
    const viewMatrixCamera = camera.matrixWorldInverse.clone();
    const projectionMatrixCamera = camera.projectionMatrix.clone();
    const modelMatrixCamera = camera.matrixWorld.clone();

    const projPosition = camera.position.clone();

    super({
      ...options,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uTexture: { value: texture },
        uViewMatrixCamera: { value: viewMatrixCamera },
        uProjectionMatrixCamera: { value: projectionMatrixCamera },
        uModelMatrixCamera: { value: modelMatrixCamera },
        uProjPosition: {  value: projPosition },
      },

      vertexShader: `
          uniform mat4 uViewMatrixCamera;
          uniform mat4 uProjectionMatrixCamera;
          uniform mat4 uModelMatrixCamera;

          varying vec4 vWorldPosition;
          varying vec3 vNormal;
          varying vec4 vTexCoords;


          void main() {
            vNormal = mat3(modelMatrix) * normal;
            vWorldPosition = modelMatrix * vec4(position, 1.0);
            vTexCoords = uProjectionMatrixCamera * uViewMatrixCamera * vWorldPosition;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,

      fragmentShader: `
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        uniform vec3 uProjPosition;

        varying vec3 vNormal;
        varying vec4 vWorldPosition;
        varying vec4 vTexCoords;
        
        void main() {
          vec2 uv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;

          vec4 outColor = texture2D(uTexture, uv);

          // this makes sure we don't render the texture also on the back of the object
          vec3 projectorDirection = normalize(uProjPosition - vWorldPosition.xyz);
          float dotProduct = dot(vNormal, projectorDirection);
          if (dotProduct < 0.0) {
            outColor = vec4(uColor, 1.0);
          }

          gl_FragColor = outColor;
        }
      `,
    });

    this.isProjectedMaterial = true;
  }
}
