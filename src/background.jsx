import { useState,useRef,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import image from "./assets/bg.jpeg";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import { useBroadcastContext, useStore } from "@livepeer/react/broadcast";

function Background() {
  const [count, setCount] = useState(0)
  const [context, setContext] = useState({})

  // const {
  //   updateMediaStream,
  // } = context?.__controlsFunctions;


  const videoRef = useRef(null);
  var videoElement  = videoRef.current;
  const canvasRef = useRef(null);
  const backgroundImage = new Image(480, 270);
  backgroundImage.src = image;

  useEffect(() => {
    
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          videoRef.current.srcObject = stream;
  
          videoRef.current.addEventListener("loadeddata", console.log(stream,"sstr"));
          

          
         });
     }, []);





  console.log(context,"bg ")

  async function startVirtualBackground() {
          videoElement = videoRef.current;
          console.log(bodyPix,"poix")
          try{
            let net =  await bodyPix.load({
              architecture: 'MobileNetV1',
              outputStride: 16, // Output stride (16 or 32). 16 is faster, 32 is more accurate.
              multiplier: 0.75, // The model's depth multiplier. Options: 0.50, 0.75, or 1.0.
              quantBytes: 2,// The number of bytes to use for quantization (4 or 2).
              });
  
  
            async function updateCanvas() {
              const segmentation = await net.segmentPerson(videoElement, {
                flipHorizontal: false, // Whether to flip the input video horizontally
                internalResolution: 'medium', // The resolution for internal processing (options: 'low', 'medium', 'high')
                segmentationThreshold: 0.7, // Segmentation confidence threshold (0.0 - 1.0)
                maxDetections: 10, // Maximum number of detections to return
                scoreThreshold: 0.2, // Confidence score threshold for detections (0.0 - 1.0)
                nmsRadius: 20, // Non-Maximum Suppression (NMS) radius for de-duplication
                minKeypointScore: 0.3, // Minimum keypoint detection score (0.0 - 1.0)
                refineSteps: 10, // Number of refinement steps for segmentation
                opacity:0.7
                
            });

            console.log(segmentation,"segmenee")

            const background = { r: 0, g: 0, b: 0, a: 0 };
            const mask = bodyPix.toMask(segmentation, background, { r: 0, g: 0, b: 0, a: 255 });

            
            console.log(mask,"maskkkk")

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

  return (
     <div className='w-full  '>
                  <button onClick={startVirtualBackground}>Start</button>
                

             <Broadcast.Root ingestUrl={getIngest("1606-8tzu-37cl-1wsj")}>
                <Broadcast.Container className='w-full'>
                  Content in plain div with no aspect ratio
                  <Broadcast.Video
                     title="Livestream"
                     style={{ height: "1000", width: "1000" }}
                     className="hidden"
                     ref={videoRef} 
                />

            <CurrentSource
                    style={{
                      position: "absolute",
                      left: 20,
                      bottom: 20,
                    }}
                    setContext={setContext}
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


                    <canvas id="canvas" width="1000" height="1000" ref={canvasRef} ></canvas>
                  
                </Broadcast.Container>

            </Broadcast.Root>


      

     </div>
  )
}

export default Background


function CurrentSource({
  style,
  __scopeBroadcast,
  setContext
}) {
  const context = useBroadcastContext("CurrentSource", __scopeBroadcast);
  useEffect(()=>{
       setContext(context)
  },[])
  // const {
  //   toggleAudio,
  //   toggleVideo,
  //   updateMediaStream,
  // } = context.__controlsFunctions;
  console.log(context.__controlsFunctions,"here")



  const { status } = useStore(context.store, ({ status }) => ({
    status,
  }));

  return status ? (
    <div style={style}>
      <span>
        Broadcast status:{" "}
        <span
          style={{
            color: "#ffffffe2",
          }}
        >
          {status}
        </span>
      </span>
    </div>
  ) : null;
}
