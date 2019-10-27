import express from 'express'

import SearchTreeModel from './models/searchTree.model'

const router = express.Router()

/**
 * Load pre-build search tree
 */
router.get('/load', async (req, res) => {
  try {
    await SearchTreeModel.loadVPTree()
    res.send('ok')
  } catch (error) {
    res.status(500).send(error)
  }
})

/**
 * Get nearest n matches in the search tree
 */
router.post('/nearestMatches/:n', async (req, res) => {
  try {
    const { userPose } = req.body
    const { n } = req.params
    const nearestMatches = await SearchTreeModel.getNearestMatches(userPose, n)

    res.send(nearestMatches)
  } catch (error) {
    res.status(500).send(error)
  }
})

/**
 * Create the posedata.json
 */
router.post('/poseData', async (req, res) => {
  try {
    const poseData = req.body

    await SearchTreeModel.createPoseDataJson(JSON.stringify(poseData))

    res.send('ok')
  } catch (error) {
    res.status(500).send(error)
  }
})

/**
 * Build and save search tree
 */
router.post('/build', async (req, res) => {
  try {
    await SearchTreeModel.buildVPTree()
    await SearchTreeModel.saveVPTree()

    res.send('ok')
  } catch (error) {
    res.status(500).send(error)
  }
})

export default router
