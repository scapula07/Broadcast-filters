import { useEffect, useState,useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4,TextureLoader } from 'three';
import { Canvas, useFrame, useGraph,useLoader,useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import image from "./assets/bg.jpeg";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import { useBroadcastContext, useStore } from "@livepeer/react/broadcast";



let faceLandmarker;
let lastVideoTime = -1;
let blendshapes = [];
let rotation;
let headMesh= [];


const options = {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    numFaces: 1,
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  };

export default function Faceless() {
    const [url, setUrl] = useState("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");
    const videoRef = useRef(null);
    var videoElement  = videoRef.current;
    const canvasRef = useRef(null);

     const { getRootProps } = useDropzone({
        onDrop: files => {
          const file = files[0];
          const reader = new FileReader();
          reader.onload = () => {
            setUrl(reader.result);
          }
          reader.readAsDataURL(file);
        }
      });


    const setup = async () => {
        videoElement = videoRef.current;
        const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, options);

        navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        }).then(function (stream) {
             console.log(stream,"Stremm")
            videoElement.srcObject = stream;
            videoElement.addEventListener("loadeddata", predict);
        });
      }


      const predict = async () => {
        const canvasElement = canvasRef.current; 
        let nowInMs = Date.now();
        if (lastVideoTime !== videoRef.current.currentTime) {
          lastVideoTime = videoRef.current.currentTime;
          const faceLandmarkerResult = faceLandmarker.detectForVideo(videoRef.current, nowInMs);
    
          if (faceLandmarkerResult.faceBlendshapes && faceLandmarkerResult.faceBlendshapes.length > 0 && faceLandmarkerResult.faceBlendshapes[0].categories) {
            blendshapes = faceLandmarkerResult.faceBlendshapes[0].categories;
    
            const matrix = faceLandmarkerResult?.facialTransformationMatrixes?.[0]?.data ? new Matrix4().fromArray(faceLandmarkerResult.facialTransformationMatrixes[0].data) : null;
            rotation = new Euler().setFromRotationMatrix(matrix);

            const stream = canvasElement.captureStream(30); 
            // console.log(stream,"stremmm")

          }
        }
    
        window.requestAnimationFrame(predict);
      }

      console.log(url,"url")
    
  return (
    <div>
           <button onClick={setup}>Start</button>
         <Broadcast.Root ingestUrl={getIngest("1606-8tzu-37cl-1wsj")}>
                <Broadcast.Container className='w-full'>
                  Content in plain div with no aspect ratio
                  <Broadcast.Video
                     title="Livestream"
                     style={{ height: "1000", width: "1000" }}
                     className="hidden"
                     ref={videoRef} 
                />

            {/* <CurrentSource
                    style={{
                      position: "absolute",
                      left: 20,
                      bottom: 20,
                    }}
                    setContext={setContext}
                  /> */}


            <Broadcast.EnabledTrigger
                  style={{
                    position: "absolute",
                    right: 20,
                    bottom: 20,
                    width: 25,
                    height: 25,
                  }}
            >
              <Broadcast.EnabledIndicator asChild matcher={false}>
                <EnableVideoIcon />
              </Broadcast.EnabledIndicator>
              <Broadcast.EnabledIndicator asChild>
                <StopIcon />
              </Broadcast.EnabledIndicator>
            </Broadcast.EnabledTrigger>


                    {/* <canvas id="canvas" width="1000" height="1000" ref={canvasRef} ></canvas> */}

                    <Canvas style={{ height: 600 }} camera={{ fov: 25 }} shadows className='relative' ref={canvasRef}>
                         <Background />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} color={new Color(1, 1, 0)} intensity={0.5} castShadow />
                        <pointLight position={[-10, 0, 10]} color={new Color(1, 0, 0)} intensity={0.5} castShadow />
                        <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
                        <Avatar url={url} />
                    </Canvas>

                    <div {...getRootProps({ className: 'dropzone' })} className=" w-full h-full absolute top-0 ">
                                <p className='hover:block hidden'>Drag & drop RPM avatar GLB file here</p>
                    </div>
                  
                </Broadcast.Container>

            </Broadcast.Root>









    </div>
  )
}





function Avatar({ url }) {
    const { scene } = useGLTF(url);
    const { nodes } = useGraph(scene);
  
    useEffect(() => {
      if (nodes.Wolf3D_Head) headMesh.push(nodes.Wolf3D_Head);
      if (nodes.Wolf3D_Teeth) headMesh.push(nodes.Wolf3D_Teeth);
      if (nodes.Wolf3D_Beard) headMesh.push(nodes.Wolf3D_Beard);
      if (nodes.Wolf3D_Avatar) headMesh.push(nodes.Wolf3D_Avatar);
      if (nodes.Wolf3D_Head_Custom) headMesh.push(nodes.Wolf3D_Head_Custom);
    }, [nodes, url]);
  
    useFrame(() => {
      if (blendshapes.length > 0) {
        blendshapes.forEach(element => {
          headMesh.forEach(mesh => {
            let index = mesh.morphTargetDictionary[element.categoryName];
            if (index >= 0) {
              mesh.morphTargetInfluences[index] = element.score;
            }
          });
        });
  
        nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
        nodes.Neck.rotation.set(rotation.x / 5 + 0.3, rotation.y / 5, rotation.z / 5);
        nodes.Spine2.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
      }
    });
  
    return <primitive object={scene} position={[0, -1.75, 3]} />
  }



  function Background() {
    const texture = useLoader(TextureLoader,image); // Replace with the path to your image
    const { scene } = useThree();
    scene.background = texture;
    return null;
  }