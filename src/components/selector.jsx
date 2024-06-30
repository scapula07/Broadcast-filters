import React,{useState,useEffect} from 'react'
import image from "../assets/bg.jpeg";
import { backgrounds } from '../data/backgrounds';
import { filters } from '../data/filters';

export default function Selector({
                            selected
                            ,videoRef,
                            videoElement,
                            canvasRef,
                            img,
                            deepAR,
                            net
                                }) {
    let data
    const [bgImage,setImage]=useState("")
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
        img=""
         switch (selected) {
            case 'Virtual backgrounds':
              console.log('You selected apple.');
              img=src
              startVirtualBackground(img)
              setImage(src)
              break;
            case 'DeepAR filters':
              console.log('You selected banana.');
              switchFilter(src?.mdl)
              setImage(src?.img)
              break;
      
            default:
              console.log('Unknown fruit.');
              data=backgrounds
          }



      }


      async function startVirtualBackground(img) {
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
                 <div className={bgImage ===src || bgImage===src?.img?'border-2 border-green-500 p-1  rounded-lg flex justify-center items-center w-full':"border border-white p-0.5  rounded-lg flex justify-center items-center w-full"}
                    onClick={()=>change(src)}
                    
                    >
                        {src?.img?.length != undefined?
                                <img 
                                src={src?.img}
                                className="h-9 w-8 rounded-full"
                                />
                                :
                                <img 
                                src={src}
                                className={img ===src?"h-6 w-6 rounded-full":"h-10"}
                                />


                        }
                   
                    
                    

                    </div>
                    )
                })

            }

</div>
  )
}
