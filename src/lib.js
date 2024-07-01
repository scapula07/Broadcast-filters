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
     setUpDeeepAr:async function (canvasRef) {
        try{

           const deepAR = await deepar.initialize({
                licenseKey: 'f308e07f9ee4bb4f9a2b9ba9db89cbfc303a89830dfb0c94a7f46b3cba7b72f4356f51ad6c22b8f9', 
                canvas:canvasRef.current,
                effect: 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators' 
             });
             return deepAR

         }catch(e){
            throw new Error(e)  
         }

     }

 }