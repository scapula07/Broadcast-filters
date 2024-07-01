import * as deepar from 'deepar';
let maskKeyPointIndexs = [10, 234, 152, 454]
let maskArray= [];



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

     },
     setUpFaceDetectionModel:async function (canvasRef) {
        try{
            const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
            return model
          }catch(e){
            throw new Error(e)  
          }
     },
     drawMask:async function(predictions,isVideo,videoRef,img){
         console.log(img,"img")
        if (maskArray.length !== predictions.length) {
           clearCanvas();
          }
            const overheadIndex = 0;
            const chinIndex = 2;
            let leftCheekIndex, rightCheekIndex;

        if (isVideo) {
             leftCheekIndex = 3;
             rightCheekIndex = 1;
        } else {
              leftCheekIndex = 1;
              rightCheekIndex = 3;
         }

        if (predictions.length > 0) {
               predictions.map((prediction, x) => {           
               const keypoints = prediction.scaledMesh; 
               let dots, maskElement;
            if (maskArray.length > x ) {
                dots = maskArray[x].keypoints;
                maskElement = maskArray[x].maskElement;
                }else {
                 dots = [];
                 maskElement = document.createElement('img');
                 maskElement.src =img?.img;
                 maskElement.id = 'mask_' + x;
                 maskElement.className = 'mask';
                 maskArray.push({ keypoints: dots, maskElement: maskElement });
          
                 setMask(maskArray)
                   document.getElementById('canvas').appendChild(maskElement);
                } 
                 maskKeyPointIndexs.forEach((index, i) => {
                    const coordinate = getCoordinate(keypoints[index][0], keypoints[index][1],videoRef,isVideo);
                    let dot;
                    if (dots.length > i) {
                        dot = dots[i];
                    } else {
                        const dotElement = document.createElement('div');
                        dotElement.className = 'dot';
                        dot = { top: 0, left: 0, element: dotElement };
                        dots.push(dot);
                    }
                        dot.left = coordinate[0];
                        dot.top = coordinate[1];
                        dot.element.style.top = dot.top + 'px';
                        dot.element.style.left = dot.left + 'px';
                        dot.element.style.position = 'absolute';
                   })

                       
                       const maskType = img?.type
                       let maskCoordinate; 
                       let maskHeight;
                       switch (maskType) {
                        case 'full':
                            maskCoordinate = { top: dots[overheadIndex].top, left: dots[leftCheekIndex].left };
                            maskHeight = dots[chinIndex].top - dots[overheadIndex].top;
                            break;
                        case 'half':
                        default:
                            maskCoordinate = dots[leftCheekIndex];
                            maskHeight = dots[chinIndex].top - dots[leftCheekIndex].top;
                            break;
                    }

                    let  maskWidth, maskSizeAdjustmentLeft ,maskSizeAdjustmentWidth, maskSizeAdjustmentHeight , maskSizeAdjustmentTop,   maskTop,     maskLeft;

                     maskWidth = (dots[rightCheekIndex].left - dots[leftCheekIndex].left) ;
                     maskSizeAdjustmentWidth = parseFloat(img?.scaleWidth);
                     maskSizeAdjustmentHeight = parseFloat(img?.scaleHeight);
                     maskSizeAdjustmentTop = parseFloat(img?.topAdj);
                    if(isVideo){
                        maskSizeAdjustmentLeft = parseFloat(img?.leftAdj);
                    }
                    else{
                        maskSizeAdjustmentLeft = 0;
                    }

                    maskTop = maskCoordinate.top - ((maskHeight * (maskSizeAdjustmentHeight-1))/2) - (maskHeight * maskSizeAdjustmentTop);
                    maskLeft = maskCoordinate.left - ((maskWidth * (maskSizeAdjustmentWidth-1))/2) - (maskWidth * maskSizeAdjustmentLeft);
                    
                    maskElement.style.top = maskTop + 'px';
                    maskElement.style.left = maskLeft + 'px';
                    maskElement.style.width = maskWidth * maskSizeAdjustmentWidth + 'px';
                    maskElement.style.height = maskHeight * maskSizeAdjustmentHeight + 'px';
                    maskElement.style.position = 'absolute';    

             })
         }
} 

 }


 function clearCanvas() {
    const canvas = document.getElementById('canvas');
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }
    maskArray = [];
}



function getCoordinate(x, y,videoRef,isVideo) {
    if (isVideo) {
        if (window.innerWidth / window.innerHeight >= videoRef.current.width / videoRef.current.height) {
            const ratio = document.getElementById('canvas').clientHeight / videoRef.current.height;
            const resizeX = x * ratio;
            const resizeY = y * ratio;
            return [resizeX, resizeY];
        } else {
            const leftAdjustment = videoRef.current.width - document.getElementById('canvas').clientWidth;
            const resizeX = x - leftAdjustment;
            const resizeY = y;
            return [resizeX, resizeY];
        }
    } else {
        return [x, y];
    }
}