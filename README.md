# move-mirror-clone
A clone of Google Move Mirror built by Nuxt.js

The implementation is based on this [blogpost](https://medium.com/tensorflow/move-mirror-an-ai-experiment-with-pose-estimation-in-the-browser-using-tensorflow-js-2f7b769f9b23).
Recommend to have a look at it if you are interested in some background stories and technical details.

## Build Setup

``` bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```


## Usage
The clone of Move Mirror is on [http://localhost:3000](http://localhost:3000), and you will need a webcam to play with it.

Once the page is ready, the right side is your webcam video with skeleton estimated by PoseNet in realtime.
The left side is the most similar mirror image at this moment.

> Currently the mirror image base has not well covered all possible poses yet. If you are interested in contributing images, please refer the Development > Mirror images and Development > vp tree sections.


## Development

### Mirror images
Mirror images are used to match the pose in the user webcam video and are stored at **~assets/images/mirror-poses**.

> **NOTE: ** You will need to rebuild the vp tree whenever you update the mirror image base. Please refer the vp tree section.

### Debugging images
Stored at **~assets/images/debug** and used for the debugging tool [http://localhost:3000/debug/matching](http://localhost:3000/debug/matching).

> **NOTE: ** You don't need to rebuild the vp tree when you update the debugging images.

### vp tree
To quickly retrieve the most similar mirror image, the normalized pose data of mirror images will be built into a vp tree.

You can use the debugging tool [http://localhost:3000/debug/mirrorimages](http://localhost:3000/debug/mirrorimages) to build or rebuild the vp tree.
Once a vp tree is successfully build, a pre-build file at **~api/models/prebuild-vptree.json** will be created for loading the tree.

> **NOTE:** The prebuild-vptree.json must exist and be up-to-date before using Move Mirror and matching debugging tool.


### Debugging tools
> **NOTE:** Debugging tools can only be accessed in the development mode (npm run dev)

There are 2 debugging tools:
#### [http://localhost:3000/debug/mirrorImages](http://localhost:3000/debug/mirrorImages)
- Draw skeletons to monitor the quality of each mirror images
- Estimate poses of all mirror images and build vp tree

#### [http://localhost:3000/debug/matching](http://localhost:3000/debug/matching)
- Monitor the matching quality by matching the debugging images with the mirror images in vp tree
