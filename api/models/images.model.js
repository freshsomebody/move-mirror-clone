import path from 'path'

import { readdirPromise, unlinkPromise } from '../utils/fs-promise'

const imageDir = 'assets/images/mirror-poses'
const debugDir = 'assets/images/debug'

export default {
  find: (debug = false) => {
    const dir = debug ? debugDir : imageDir

    return readdirPromise(dir)
  },

  delete: (image) => {
    return unlinkPromise(path.join(imageDir, image))
  }
}
