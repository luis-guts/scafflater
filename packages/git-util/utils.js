const {spawn} = require('child_process')
const {PassThrough} = require('stream')

/**
 *
 * @param {string} command the command to run
 * @param {string[]} args the arguments to pass the command
 * @param {stream} logStream the log streamer to capture log messages
 */
const runCommand = async (
  command,
  args
) => {
  // const process = spawnSync(command, args, {encoding: 'utf8'})
  // if (process.error) {
  //   throw new Error(process.error)
  // }

  // return process.stdout

  return new Promise((resolve, reject) => {
    var scriptOutput = ''
    const process = spawn(command, args)

    process.stdout.setEncoding('utf8')
    process.stdout.on('data', data => {
      data = data.toString()
      scriptOutput += data
    })

    process.stderr.on('data', data => {
      data = data.toString()
      scriptOutput += data
    })

    process.on('error', error => {
      return reject(error)
    })

    process.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Command ${command} failed, exit code: ${code} \n ${scriptOutput}`))
      }
      return resolve(scriptOutput)
    })
  })
}

module.exports = {
  runCommand,
}
