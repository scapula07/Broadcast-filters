import * as deepar from 'deepar';

export const livepeerAR= {
    setupBodyPix:async function () {
           try{
            const net = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16, 
                multiplier: 0.75, 
                quantBytes: 2,
                });

                return net

            }catch(e){
             throw new Error(e)  
            }

     },
     setUpDeeepAr:async function () {
        try{

           const deepAR = await deepar.initialize({
                licenseKey: 'f87b53cd1948b8f5419fe69b5c2993d78f5858d64c681f0996c39147602ab204cbd19f596313244b', 
                canvas:canvasRef.current,
                effect: 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators' 
             });
             return deepAR

         }catch(e){
            throw new Error(e)  
         }

     }

 }