import fs from 'fs'

/**
 * Wrap fs.readdir by Promise
 * @param {string} dir the directory to be read
 * @returns files: string[] = the list of files in the directory
 */
export function readdirPromise (dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) {
        reject(error)
      }
      resolve(files)
    })
  })
}

/**
 * Wrap fs.readFile by Promise
 * @param {string} filePath path of the file to be read
 * @returns data: any = the content of the file
 */
export function readFilePromise (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        reject(error)
      }
      resolve(data)
    })
  })
}

/**
 * Wrap fs.writeFile by Promise
 * @param {string} filePath path of  the file to be written
 * @param {any} data the data to be written into the file path
 */
export function writeFilePromise (filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (error) => {
      if (error) {
        reject(error)
      }
      resolve('ok')
    })
  }) 
}

/**
 * Wrap fs.unlink by Promise
 * @param {string} filePath path of  the file to be deleted
 */
export function unlinkPromise (filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        reject(error)
      }
      resolve('ok')
    })
  })
}
