import * as THREE from 'three';


interface buildingBlocks {
  coords: [number, number, number]
}

type coord = [number, number, number];
type BuildingType = "random" | "2pieces" | "squares";

const blockSize = 0.5;

export function buildingFactory(screenSize: number, geometry: THREE.BoxGeometry, material: THREE.ShaderMaterial, buildingType: BuildingType) : THREE.Mesh[] {
    switch(buildingType) {
      case "2pieces":
        return create2Pieces(geometry, material);
      case "squares":
        return createSquares(geometry, material);
      case "random":
      default:
        return createRandomBuilding(screenSize, geometry, material);
    }
  }

function createRandomBuilding(screenSize: number, geometry: THREE.BoxGeometry, material: THREE.ShaderMaterial) : THREE.Mesh[] {
    let objects : THREE.Mesh[] = [];
    for(let x = -screenSize; x <= screenSize; x+= blockSize) {
        for(let y = -screenSize; y <= screenSize; y+= blockSize) {
            const mesh = createBlock(geometry, material, [x * 1.0, y * 1.0, Math.random() * -3]);
            objects.push(mesh);
        }
    }
    return objects;
}

function createBlock(geometry: THREE.BoxGeometry, material: THREE.ShaderMaterial, [x, y, z]: [number, number, number]) : THREE.Mesh {
  let mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(x, y , z);
  return mesh
}

function createBuilding(geometry: THREE.BoxGeometry, material: THREE.ShaderMaterial, coords: coord[]) : THREE.Mesh[] {
  let objects : THREE.Mesh[] = [];
  coords.forEach(([x,y,z]) => {
    const mesh = createBlock(geometry, material, [x, y, z]);
    objects.push(mesh);
  });
  return objects;
}


function createSquares(geometry: THREE.BoxGeometry, material: THREE.ShaderMaterial) : THREE.Mesh[] {
  let objects : THREE.Mesh[] = [];
  const squarePoints : coord[] = [
    [0,0,0],
    [0.5,0,0],
    [1,0,0],
    [1.5,0,0],

    [0,0.5,0],
    [0,1,0],
    [0,1.5,0],

    [0.5,1.5,0],
    [1,1.5,0],
    [1.5,1.5,0],

    [1.5, 1, 0],
    [1.5, 0.5, 0],
  ];

  const coordsSquare1 : coord[] = squarePoints.map(([x, y, z]) => [x + blockSize/2, y + blockSize/2, z]);
  const coordsSquare2 : coord[] = squarePoints.map(([x, y, z]) => [x - 2 + blockSize/2, y + blockSize/2, z]);
  const coordsSquare3 : coord[] = squarePoints.map(([x, y, z]) => [x + blockSize/2, y - 2 + blockSize/2, z]);
  const coordsSquare4 : coord[] = squarePoints.map(([x, y, z]) => [x - 2 + blockSize/2, y - 2 + blockSize/2, z]);

  const square1 = createBuilding(geometry, material, coordsSquare1);
  const square2 = createBuilding(geometry, material, coordsSquare2);
  const square3 = createBuilding(geometry, material, coordsSquare3);
  const square4 = createBuilding(geometry, material, coordsSquare4);
  objects.push(...square1);
  objects.push(...square2);
  objects.push(...square3);
  objects.push(...square4);

  return objects;
}

function create2Pieces(geometry: THREE.BoxGeometry, material: THREE.ShaderMaterial) : THREE.Mesh[] {
  let objects : THREE.Mesh[] = [];
  let coords : coord[] = [];

  const widthBuilding = 1.5;
  const heightBuilding = 2;

  for(let y = -heightBuilding + blockSize/2; y < heightBuilding; y+= blockSize) {
    for(let x = 0; x < widthBuilding; x += blockSize) {
      for(let z = 0; z < widthBuilding; z += blockSize) {
        coords.push([x, y, z]);
      }
    }
  }

  const coordsBuilding1 : coord[] = coords.map(([x, y, z]) => [x + 0.75, y, z - 1 ]);
  const coordsBuilding2 : coord[] = coords.map(([x, y, z]) => [x - 1.75, y, z - 1 ]);


  const building1 = createBuilding(geometry, material, coordsBuilding1);
  objects.push(...building1);

  const building2 = createBuilding(geometry, material, coordsBuilding2);
  objects.push(...building2);

  return objects;
}