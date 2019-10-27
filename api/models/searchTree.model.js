import path from 'path'

import VPTreeFactory from 'vptree'
import { cosineDistanceMatching, weightedDistanceMatching } from 'posenet-similarity'

import { readFilePromise, writeFilePromise } from '../utils/fs-promise'

const TreeDir = 'api/models'
const PostDataPath = path.join(TreeDir, 'posedata.json')
const prebuildVPTreePath = path.join(TreeDir, 'prebuild-vptree.json')

let poseData
let vptree

/**
 * Get data from posedata.json
 */
async function getPoseData () {
  try {
    const poseData = await readFilePromise(PostDataPath)
    return JSON.parse(poseData)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Load vptree from the preset file
 */
async function loadVPTree () {
  try {
    // Read pre-build vptree
    let prebuildVPTree = await readFilePromise(prebuildVPTreePath)
    if (!prebuildVPTree) {
      throw new Error('No pre-build tree to be loaded')
    }
    prebuildVPTree = JSON.parse(prebuildVPTree)

    // Read poseData
    if (!poseData) {
      poseData = await getPoseData()
    }

    vptree = VPTreeFactory.load(poseData, weightedDistance, prebuildVPTree)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Get n images with  the most similar pose in the vp tree
 * @param { { vectorXY: [number], vectorConfidence: [number] } } userPose normalized user pose vectors
 * @param {number} n = number of images returned
 * @returns nearest images: string[] = array of most similar images
 */
async function getNearestMatches (userPose, n = 1) {
  try {
    if (!vptree) {
      await loadVPTree()
    }
  
    if (!poseData) {
      poseData = await getPoseData()
    }
  
    let nearestImages = vptree.search(userPose, n)
  
    // indexes (in relation to poseData) of nearest matches.
    const nearestMatches = nearestImages.map(({ i }) => poseData[i].image)
  
    return nearestMatches
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Create the posedata.json file
 * @param { [{ image: string, vectorXY: [number], vectorConfidence: [number] }] } data
 */
function createPoseDataJson (data) {
  if (!data) {
    // Scan images and estimate the poseData
  }

  return writeFilePromise(PostDataPath, data)
}

/**
 * Create a vp tree
 */
async function buildVPTree () {
  poseData = await getPoseData()

  vptree = VPTreeFactory.build(poseData, weightedDistance)
}

/**
 * Save the vptree into a preset file
 */
async function saveVPTree () {
  // If vptree doesn't exist => build vptree
  if (!vptree) {
    await buildVPTree() 
  }

  const prebuildVPTree = JSON.stringify(vptree.tree)

  return await writeFilePromise(prebuildVPTreePath, prebuildVPTree)
}

/**
 * The distance function for building the vp tree
 * @param { { image: string, vectorXY: [number], vectorConfidence: [number] } } poseData1
 * @param { { image: string, vectorXY: [number], vectorConfidence: [number] } } poseData2
 * 
 * @returns distance: number
 */
function weightedDistance (poseData1, poseData2) {
  const { vectorXY: vXY1, vectorConfidence: vC1 } = poseData1
  const { vectorXY: vXY2 } = poseData2

  return weightedDistanceMatching(vXY1, vXY2, vC1)
}

function cosineDistance (poseData1, poseData2) {
  const { vectorXY: vXY1 } = poseData1
  const { vectorXY: vXY2 } = poseData2
  return cosineDistanceMatching(vXY1, vXY2)
}

export default {
  getPoseData,
  getNearestMatches,
  createPoseDataJson,
  buildVPTree,
  loadVPTree,
  saveVPTree
}
