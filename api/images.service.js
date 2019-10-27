import express from 'express'

import ImagesModel from './models/images.model'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const imageList = await ImagesModel.find()
    res.send(imageList)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/debug', async (req, res) => {
  try {
    const imageList = await ImagesModel.find(true)
    res.send(imageList)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.delete('/:image', async (req, res) => {
  const { image } = req.params
  try {
    await ImagesModel.delete(image)
    res.send('ok')
  } catch (error) {
    res.status(500).send(error)
  }
})

export default router
