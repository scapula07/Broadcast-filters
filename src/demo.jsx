import React,{useRef,useEffect} from 'react'
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import image from "./assets/bg.jpeg";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import { useBroadcastContext, useStore } from "@livepeer/react/broadcast";
import { useState } from 'react';
import { RiArrowRightSLine ,RiArrowLeftSLine,RiArrowRightDoubleLine,RiArrowLeftDoubleLine} from "react-icons/ri";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { TbBackground } from "react-icons/tb";
import { MdFace } from "react-icons/md";
import { backgrounds } from './data/backgrounds';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';


let net=null
let img=""
export default function Demo() {
       
            const videoRef = useRef(null);
            var videoElement  = videoRef.current;
            const canvasRef = useRef(null);


            const [isCamOnly,setCamOnly]=useState(false)
            const [isCollapse,setCollapseTab]=useState(true)
            const [selectVr,setSelectedVr]=useState("")
            const [isSelect,setisSelected]=useState("")

            const [isLoading,setLoading]=useState(true)

          

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
            console.log(net,"net")

      
         
  return (
        <div className='w-full h-screen flex flex-col items-center py-10'>
                <h5>Powered by Livepeer</h5>
                <div className='w-1/2'>
                <Broadcast.Root ingestUrl={getIngest("1606-8tzu-37cl-1wsj")}>
                      <Broadcast.Container className='w-full'>
                      
                            <Broadcast.Video
                                title="Livestream"
                                style={{ height: "1000", width: "1000" }}
                                className="relative hidden"
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


                      <canvas id="canvas"  ref={canvasRef} className="relative w-full -z-10"></canvas>


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
                                            [  {
                                                icon:      <TbBackground />,
                                                title: "Virtual backgrounds",
                                                click:()=>setUpBodyPix()
                                                

                                            },
                                            {
                                                icon:      <MdFace  />,
                                                title: "Face filters",
                                                click:()=>{}

                                            },
                                            {
                                                icon:      <MdFace  />,
                                                title:"Faceless streaming",
                                                click:()=>{}

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
                                                   <Selector
                                                   selected={isSelect}
                                                  
                                                   videoElement={videoElement}
                                                   videoRef={videoRef}
                                                   canvasRef={ canvasRef }
                                                  />
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
         
            const [bgImage,setImage]=useState(image)
            const backgroundImage = new Image(480, 270);
        
         console.log(selected,"s;ll")
         let data
         switch (selected) {
            case 'Virtual backgrounds':
              console.log('You selected apple.');
              data=backgrounds
              break;
            case 'Face filters':
              console.log('You selected banana.');
              break;
      
            default:
              console.log('Unknown fruit.');
              data=backgrounds
          }

          useEffect(()=>{
            img=image
          },[])


          const changeBackground=(src)=>{
            img=src
            startVirtualBackground()
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
                           /// OLD
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
    
            
          
        
      return(
        <div className='w-full h-full py-4 flex flex-col overflow-y-scroll px-2 space-y-4'
          
        >
                {data?.map((src)=>{
                        return(
                        <div className='border border-white p-0.5  rounded-lg flex justify-center items-center w-full'
                        onClick={()=>changeBackground(src)}
                        
                        >
                            <img 
                            src={src}
                            className="h-10"
                            />
                        
                        

                        </div>
                        )
                    })

                }

    </div>
      )
}