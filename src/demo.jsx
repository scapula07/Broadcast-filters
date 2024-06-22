import React,{useRef,useEffect} from 'react'
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import image from "./assets/bg.jpeg";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import { useBroadcastContext, useStore } from "@livepeer/react/broadcast";
import { useState } from 'react';
import { RiArrowRightSLine ,RiArrowLeftSLine,RiArrowRightDoubleLine,RiArrowLeftDoubleLine} from "react-icons/ri";
import { TbBackground } from "react-icons/tb";
import { MdFace } from "react-icons/md";
import { FaMasksTheater } from "react-icons/fa6";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { backgrounds } from './data/backgrounds';
import { filters } from './data/filters';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import * as deepar from 'deepar';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4,TextureLoader } from 'three';
import { Canvas, useFrame, useGraph,useLoader,useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useDropzone } from 'react-dropzone';

let net=null
let img=""
let deepAR;
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
export default function Demo() {
       
            const videoRef = useRef(null);
            var videoElement  = videoRef.current;
            const canvasRef = useRef(null);


            const [isCamOnly,setCamOnly]=useState(false)
            const [isCollapse,setCollapseTab]=useState(true)
            const [selectVr,setSelectedVr]=useState("")
            const [isSelect,setisSelected]=useState("")

            const [isLoading,setLoading]=useState(true)
            const [url, setUrl] = useState("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");

          

            useEffect(() => {
    
                navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                    videoRef.current.srcObject = stream;
            
                    videoRef.current.addEventListener("loadeddata", console.log(stream,"sstr"));
                  });
               }, []);


            async function setUpBodyPix() {
                   setLoading(true)
                  try{
                       net =  await bodyPix.load({
                        architecture: 'MobileNetV1',
                        outputStride: 16, 
                        multiplier: 0.75, 
                        quantBytes: 2,
                        });
                     
                    setLoading(false)


            

                   }catch(e){

                    console.log(e)
                    setLoading(false)
                    setisSelected("")
                    toast.error("Error loading model",{duration:3000})
                   }

            }
         
            const setUpDeeepAr=async()=>{
                setLoading(true)
                try{
                    deepAR = await deepar.initialize({
                        licenseKey: 'f87b53cd1948b8f5419fe69b5c2993d78f5858d64c681f0996c39147602ab204cbd19f596313244b', 
                        canvas:canvasRef.current,
                        effect: 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators' 
                     });
                setLoading(false)
                }catch(e){
                    console.log(e)
                    setLoading(false)
                    setisSelected("")
                    toast.error("Error loading model",{duration:3000})
                }
            
            
             }
             const setupMediaPipe = async () => {
                setLoading(true)
                videoElement = videoRef.current;
                try{
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
                 setLoading(false)
                }catch(e){
                 console.log(e)
                 setLoading(false)
                 setisSelected("")
                 toast.error("Error loading model",{duration:3000})
                }
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
                 
        
                   }
                }
            
                window.requestAnimationFrame(predict);
              }
            
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
        

      
         
  return (
        <div className='w-full h-screen flex flex-col items-center py-10'>
                <h5>Powered by Livepeer</h5>
                <div className='w-1/2'>
                <Broadcast.Root ingestUrl={getIngest("1606-8tzu-37cl-1wsj")}>
                      <Broadcast.Container className='w-full'>
                      
                            <Broadcast.Video
                                title="Livestream"
                                style={{ height: "1000", width: "1000" }}
                                className={isSelect?.length>0?"hidden":"relative block"}
                                ref={videoRef} 
                            />

    


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

                    {["Faceless streaming"]?.includes(isSelect)?
                     
                      <>
                    
                        <Canvas style={{ height: 600 }} camera={{ fov: 25 }} shadows className='relative w-full h-1/2 -z-10' ref={canvasRef}>
                            <Background />
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} color={new Color(1, 1, 0)} intensity={0.5} castShadow />
                            <pointLight position={[-10, 0, 10]} color={new Color(1, 0, 0)} intensity={0.5} castShadow />
                            <pointLight position={[0, 0, 10]} intensity={0.5} castShadow />
                            <Avatar url={url} />
                       </Canvas>

                        <div {...getRootProps({ className: 'dropzone' })} className=" w-full h-1/2 absolute top-0 "
                             data-tooltip-id={"my-tooltip-2"}
                          >
                            
                        </div>
                    </>
                        :
                        <canvas id="canvas"  ref={canvasRef} className="relative w-full h-full -z-10"></canvas>
                        
                    }


                          <div className={isCollapse?'absolute bg-red-500 w-6 h-10 top-0 py-0.5':'absolute bg-red-500 w-14  h-full top-0 py-2 overflow-y-hidden' }>
                               <h5 className={'w-full flex justify-end'}>
                                  {isCollapse?
                                     <RiArrowRightDoubleLine
                                         className='text-white font-semibold text-4xl'
                                         onClick={()=>setCollapseTab(false)}
                                          data-tooltip-id="my-tooltip-1"
                                         />
                                         :
                                       
                                        <RiArrowLeftDoubleLine
                                            className='text-white font-semibold text-2xl'
                                            onClick={()=>isSelect?.length >0 ?setisSelected(""):setCollapseTab(true)}
                                            />
                                      
                                       
                                  }
                                 
                              </h5>

                              {!isCollapse&&isSelect?.length ===0&&
                                    <div className='w-full h-full py-4 flex flex-col overflow-y-scroll px-2 space-y-4'>
                                        {
                                            [  
                                            {
                                                icon:<TbBackground />,
                                                title: "Virtual backgrounds",
                                                click:()=>setUpBodyPix()
                                                

                                            },
                                            {
                                                icon:<MdFace  />,
                                                title: "DeepAR filters",
                                                click:()=>setUpDeeepAr()

                                            },
                                            {
                                                icon:<FaMasksTheater />,
                                                title:"Mask filters",
                                                click:()=>{}

                                            },
                                            {
                                                icon:<MdFace  />,
                                                title:"Faceless streaming",
                                                click:()=>setupMediaPipe()

                                            },

                                            
                                        
                                                

                                            ]?.map((tab)=>{
                                                return(
                                                <div className='border border-white p-1.5 rounded-lg flex justify-center items-center w-full'
                                                    data-tooltip-id={tab?.title}
                                                    onMouseOver={()=>setSelectedVr(tab?.title)}
                                                    onMouseOut={()=>setSelectedVr("")}
                                                    
                                                    >
                                                    <h5 className='text-3xl'
                                                      onClick={()=>setisSelected(tab?.title) ||tab?.click()}
                                                    >
                                                       {tab?.icon}

                                                    </h5>
                                                

                                                </div>
                                                )
                                            })

                                        }

                                    </div>
                                    }

                                   {!isCollapse&&isSelect?.length >0&&
                                        <>
                                               {!isLoading?
                                                   
                                                    <>
                                                      {["Virtual backgrounds","DeepAR filters","Mask filters"]?.includes(isSelect)?
                                                             <Selector
                                                             selected={isSelect}
                                                             
                                                             videoElement={videoElement}
                                                             videoRef={videoRef}
                                                             canvasRef={ canvasRef }
                                                          />
                                                          :
                                                          <>
                                                          </>
                                                        }
                                                      
                                                     </>
                                              
                                                     :
                                                    <div className='w-full flex justify-center py-2'>
                                                        <ClipLoader color='white' size={10}/>
                                                   </div>
                                                

                                               } 
                                        </>
                                      
                         
                                    }
                           
                               

                         </div>

                  
                </Broadcast.Container>

            </Broadcast.Root>
                       

               </div>

               <ReactTooltip
                    id="my-tooltip-1"
                    place="bottom"
                    content="Virtual Filters"
                    className='text-sm'
                />
                <ReactTooltip
                    id="my-tooltip-2"
                    place="bottom"
                    content="Drag & drop avater "
                    className='text-sm'
                />
                    <ReactTooltip
                    id={selectVr}
                    place="bottom"
                    content={selectVr}
                    className='text-sm'
                />
               <Toaster />
       </div>
  )
}





const Selector=({selected,videoRef,videoElement,canvasRef })=>{
        let data
        const [bgImage,setImage]=useState(image)
        const backgroundImage = new Image(480, 270);
        
    
         switch (selected) {
            case 'Virtual backgrounds':
              console.log('You selected apple.');
              data=backgrounds
              break;
            case 'DeepAR filters':
              console.log('You selected banana.');
              data=filters
              break;
      
            default:
              console.log('Unknown fruit.');
              data=backgrounds
          }

          useEffect(()=>{
            img=image
          },[])


          const change=(src)=>{
             switch (selected) {
                case 'Virtual backgrounds':
                  console.log('You selected apple.');
                  img=src
                  startVirtualBackground()
                  break;
                case 'DeepAR filters':
                  console.log('You selected banana.');
                  switchFilter(src?.mdl)
                  
                  break;
          
                default:
                  console.log('Unknown fruit.');
                  data=backgrounds
              }



          }


          async function startVirtualBackground() {
                videoElement = videoRef.current;
                backgroundImage.src =img;
            try{
                async function updateCanvas() {
                    
                    const segmentation = await net.segmentPerson(videoElement, {
                      flipHorizontal: false, 
                      internalResolution: 'medium', 
                      segmentationThreshold: 0.7, 
                      maxDetections: 10,
                      scoreThreshold: 0.2, 
                      nmsRadius: 20, 
                      minKeypointScore: 0.3, 
                      refineSteps: 10, 
                      opacity:0.7
                      
                  });
      
    
      
                  const background = { r: 0, g: 0, b: 0, a: 0 };
                  const mask = bodyPix.toMask(segmentation, background, { r: 0, g: 0, b: 0, a: 255 });
      
                  
               
      
                  const canvasElement = canvasRef.current; 
                  canvasElement.width = videoElement.videoWidth;
                  canvasElement.height = videoElement.videoHeight;
      
                  const ctx = canvasElement?.getContext("2d")
                   
                  const maskBlurAmount = 5; 
                  const opacity = 0.5; 
      
                  if (mask) {
                        
                      ctx.putImageData(mask, 0, 0);
                      ctx.globalCompositeOperation = 'source-in';
      
                   
                      if (backgroundImage.complete) {
                          ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
                      } else {
                        
                          backgroundImage.onload = () => {
                              ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
                          };
                      }
      
                     
                      ctx.globalCompositeOperation = 'destination-over';
                      ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                      ctx.globalCompositeOperation = 'source-over';
      
                      const stream = canvasElement.captureStream(30); 
                      console.log(stream,"Canvas")
      
                   
                      await new Promise((resolve) => setTimeout(resolve, 100));
      
                    
                  }
                  requestAnimationFrame(updateCanvas);
      
                  }
                  updateCanvas();

            }catch(e){
                console.log(e)
            }
           }
    


           const switchFilter=async(mdl)=>{
                try{
                    await deepAR.switchEffect(mdl);
                }catch(e){
                    console.log(e)
                }
           }
           
            
          
        
      return(
        <div className='w-full h-full py-4 flex flex-col overflow-y-scroll px-2 space-y-4'
          
        >
                {data?.map((src)=>{
                        return(
                     <div className='border border-white p-0.5  rounded-lg flex justify-center items-center w-full'
                        onClick={()=>change(src)}
                        
                        >
                            {src?.img?.length != undefined?
                                    <img 
                                    src={src?.img}
                                    className="h-10"
                                    />
                                    :
                                    <img 
                                    src={src}
                                    className="h-10"
                                    />


                            }
                       
                        
                        

                        </div>
                        )
                    })

                }

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
    const texture = useLoader(TextureLoader,image); 
    const { scene } = useThree();
    scene.background = texture;
    return null;
  }