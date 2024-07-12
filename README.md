# Client-side AI compute[Livepeerjs-AR]:A plugin for Livepeer Broadcast component
## Content
1. Overview
2. Installation
3. Features
4. Customization
5. DEEPAR and Other integration
6. Code Implementation Tutorial
7. Resources

## Overview
This SDK/package is your go-to solution for enhancing the Livepeer Broadcast components with virtual filters and augmented reality such as Virtual backgrounds, AR filters, Faceless streaming etc.Whether you're a developer looking to build Tiktok/snapchat clones or build out Virtual-try-on products on the Livepeer infrastruture, this code sample and SDK will help you achieve these in a short time.

[Demo app](https://broadcast-fiiter-demo.vercel.app/)

Plugin:[Livepeerjs-ar](https://github.com/livepeer-ssai/IMA-Adwrapper-Livepeer)

## Installation
To install the SDK package from npm, use the following command:
```
   npm install 
```
## Requirements
Browser Compatibility: Supports all major browsers.

## SDK Example Usage
```js
    import {BroadcastAR} from 'livepeerjs-player-filters'
    import * as Broadcast from "@livepeer/react/broadcast";
    import { getIngest } from "@livepeer/react/external";

    ....
    <BroadcastAR
         videoRef={videoRef}
         isSelect={isSelect}
         setisSelected={setisSelected}
         opt={opt}
         className="w-1/2 h-full"
       >
         <Broadcast.Root ingestUrl={getIngest("1606-8tzu-37cl-1wsj")}>
               <Broadcast.Container className='w-full'>
                 
                      <Broadcast.Video
                          title="Livestream"
                          style={{ height: "100%", width: "100%" }}
                          className={isSelect?.length>0?"hidden":"relative "}
                          ref={videoRef} 
                          
                          
                      />
                  </Broadcast.Container>
             </Broadcast.Root>
        
    </BroadcastAR>


```
##### Create the opt params with the right mode, 'BACKGROUND','FACE','DEEPAR'

```js
     const opt=[
      {
        mode:"BACKGROUND",
        data:backgrounds
      },
     {
       mode:"FACE",
       data:backgrounds
      },
      {
        mode:"DEEPAR",
        data:filters,
        liscence_key:""

      }
   ]

```

## Features
1. Virtual backgrounds: with the sdk you can change your video background while streaming to any image you want,by passing an array of images to the wrapper and mode:'BACKGROUND'
   ```js
      import bg1 from "../assets/bg.jpeg"
      import bg2 from "../assets/bg1.jpg"
      import bg3 from "../assets/bg2.jpg"

      
      export const backgrounds=[
          bg1,
          bg2,
          bg3,
         ]

   ```
2. AR filters- Effects and face(mask) filters : the sdk can render filters in your video,by passing an arrage of images or gltf files to the wrapper ,with mode set to 'FACE' | 'DEEPAR'
```js
      export const filters=[
          {
              img:"/effect/Burning Effect/fire/frame000000.png",
              mdl:"/effects/Burning Effect/burning_effect.deepar"
          },
          {
              img:"/effect/Flower Face/textures/vegg_diffuse.png",
              mdl:"/effect/Flower Face/flower_face.deepar",
      
          },
      ]
```

3. AR Faceless streaming: this feature is for streamers that want to maintain or remain anonymous. With the sdk , a streamer can simply upload or drag and drop is Avatar into the Broadcast component. The Avatar mimicks every face motion and gestures of the user.



## Customization
For developers looking to fully customize the workflow or UI of this component without using the widget wrapper provided by the SDK, can use functionalities exposed by the sdk.

## DEEPAR and Other integration
The sdk support the use of DEEPAR filters by integrating DEEPAR library. Developers looking to support DEEPAR filters with the Livepeer stream-from-browser Broadcast component can use the SDK.

```js
      <BroadcastAR
         opt={
               [
                {
                 mode:"DEEPAR",
                 data:filters,
                 liscence_key:""

                 }
                ]
             }
      >
    </BroadcastAR>

```

You can get the liscense_key from your DEEPAR developer Dashboard portal

### Other integration: BANUBA coming soon
