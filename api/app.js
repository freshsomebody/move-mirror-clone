import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'

import SearchTreeService from './searchTree.service'
import ImagesService from './images.service'

const app = express()

app.use(compression())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/searchTree', SearchTreeService)
app.use('/images', ImagesService)

export default {
  path: '/api',
  handler: app
}
