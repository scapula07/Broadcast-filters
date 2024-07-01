import React,{useRef,useEffect} from 'react'
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import image from "./assets/bg.jpeg";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import { useBroadcastContext, useStore } from "@livepeer/react/broadcast";
import { useState } from 'react';
import { RiArrowRightWideFill,RiArrowLeftWideFill} from "react-icons/ri";
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
import { PiVirtualRealityFill } from "react-icons/pi";
import {livepeerAR} from "./lib"
import  Selector from "./components/selector"
import Avatar from "./components/avater"

let net=null
let model=null
let img=""
let deepAR;
let faceLandmarker;
let lastVideoTime = -1;
let blendshapes = [];
let rotation;
let headMesh= [];
let maskKeyPointIndexs = [10, 234, 152, 454]
let maskArray= [];


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





export default function Test() {
       
            const videoRef = useRef(null);
            var videoElement  = videoRef.current;
            const canvasRef = useRef(null);


            const [isVideo,setisVideo]=useState(false)
            const [isCollapse,setCollapseTab]=useState(true)
            const [selectVr,setSelectedVr]=useState("")
            const [isSelect,setisSelected]=useState("")
            const [ predictions,setPredictions]=useState([])
            const [ detectFace,setDetectFace]=useState(false)
            const [bgMask,setMask]=useState({})
            const [isLoading,setLoading]=useState(true)
            const [url, setUrl] = useState("https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb?morphTargets=ARKit&textureAtlas=1024");

          

            useEffect(() => {
    
                navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                    videoRef.current.srcObject = stream;
            
                    videoRef.current.addEventListener("loadeddata",detectFaces);
                  });
               }, [isVideo]);


            async function setUpBodyPix() {
                    setLoading(true)
                  try{
                     net = await livepeerAR.setupBodyPix()                    
                     setLoading(false)
                   }catch(e){
                    setLoading(false)
                    setisSelected("")
                    toast.error("Error loading model! Refresh",{duration:3000})
                   }

            }
         
            const setUpDeeepAr=async()=>{
                   setLoading(true)
                try{
                    deepAR = await livepeerAR.setUpDeeepAr(canvasRef)
                    setLoading(false)
                }catch(e){
                 
                    setLoading(false)
                    setisSelected("")
                    toast.error("Error loading model! Refresh",{duration:3000})
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
                       
                        videoElement.srcObject = stream;
                        videoElement.addEventListener("loadeddata", predict);
                    });
                 setLoading(false)
                }catch(e){
                 console.log(e)
                 setLoading(false)
                 setisSelected("")
                 toast.error("Error loading model! Refresh",{duration:3000})
                }
              }


              const predict = async () => {
                        const canvasElement = canvasRef.current; 
                        let nowInMs = Date.now();
                    if (lastVideoTime !== videoRef.current.currentTime) {
                        lastVideoTime = videoRef.current.currentTime;
                        const faceLandmarkerResult = faceLandmarker.
                                                     detectForVideo(videoRef.current, nowInMs);
                
                    if (faceLandmarkerResult.faceBlendshapes && faceLandmarkerResult.faceBlendshapes.length > 0 && faceLandmarkerResult.faceBlendshapes[0].categories) {
                        blendshapes = faceLandmarkerResult.faceBlendshapes[0].categories;
                
                        const matrix = faceLandmarkerResult?.facialTransformationMatrixes?.[0]?.data ? new Matrix4().
                                           fromArray(faceLandmarkerResult.facialTransformationMatrixes[0].data) : null;
                        rotation = new Euler().setFromRotationMatrix(matrix);
            
                        const stream = canvasElement.captureStream(30); 
                    
            
                    }
                   }
            
                       window.requestAnimationFrame(predict);
                 }

                const setupFaceDetectionModel=async()=>{
                         setLoading(true)
                      try{                    
                          model = await livepeerAR.setUpFaceDetectionModel()
                          console.log(model,"mdl")
                          setisVideo(true);
                          setDetectFace(true);
                          setLoading(false)
                    
                       }catch(e){
                        console.log(e)
                        setLoading(false)
                        setisSelected("")
                        toast.error("Error loading model! Refresh",{duration:3000})
                        
                       }
                  }
            
             


                async function detectFaces() {
                    try{
                        
                        let inputElement = videoRef.current
                        let flipHorizontal = isVideo;
                        await model.estimateFaces
                            ({
                                input: inputElement,
                                returnTensors: false,
                                flipHorizontal: flipHorizontal,
                                predictIrises: false
                            }).then(predictions => {
                           
                            let confident_predictions = predictions.filter(function(p) {
                                return p.faceInViewConfidence > 0.5;
                            });
                            console.log(confident_predictions,"ppp")
                            setPredictions(confident_predictions)
                            livepeerAR.drawMask(confident_predictions,isVideo,videoRef,img);
                            if(isVideo){
                                requestAnimationFrame(detectFaces)
                             }
                         });
                         if(!isVideo){
                            return
                          }

                      }catch(e){
                        if(!isVideo){
                            return
                           }
                        toast.error("Error! Mask filters still under dev",{duration:3000})

                      }         
                  
                   
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
                                className={isSelect?.length>0?"hidden":"relative "}
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
                            <Avatar 
                                url={url}
                                headMesh={headMesh}
                                blendshapes={blendshapes}
                                rotation={rotation}
                             />
                       </Canvas>

                        <div {...getRootProps({ className: 'dropzone' })} className=" w-full h-1/2 absolute top-0 "
                             data-tooltip-id={"my-tooltip-2"}
                          >
                            
                        </div>
                    </>
                        :
                        <canvas id="canvas"  ref={canvasRef} className="relative w-full h-full -z-10"></canvas>
                        
                    }


                          <div className={isCollapse?'absolute bg-slate-400 bg-opacity-50 rounded-tr-2xl  rounded-br-2xl w-6 h-20 top-0 py-0.5':'absolute bg-slate-400 bg-opacity-50 w-14  h-full top-0 py-2 overflow-y-hidden' }>
                            <h5 className={isCollapse?'w-full flex items-center h-full':'w-full flex justify-end'}>
                                        {isCollapse?
                                            <RiArrowRightWideFill
                                                className='text-white font-semibold text-4xl'
                                                onClick={()=>setCollapseTab(false)}
                                                data-tooltip-id="my-tooltip-1"
                                                />
                                                :
                                            
                                            <RiArrowLeftWideFill
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
                                                icon:<PiVirtualRealityFill
                                                        className='text-blue-600'
                                                      />,
                                                title: "DeepAR filters",
                                                click:()=>setUpDeeepAr()

                                            },
                                            {
                                                icon:<FaMasksTheater />,
                                                title:"Mask filters",
                                                click:()=>setupFaceDetectionModel()

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
                                                    <h5 className='text-xl text-white'
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
                                                                img={img}
                                                                net={net}
                                                                deepAR={deepAR}                                                           
                                                                videoElement={videoElement}
                                                                videoRef={videoRef}
                                                                canvasRef={ canvasRef }
                                                                setMask={setMask}
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


  function Background() {
    const texture = useLoader(TextureLoader,image); 
    const { scene } = useThree();
    scene.background = texture;
    return null;
  }




