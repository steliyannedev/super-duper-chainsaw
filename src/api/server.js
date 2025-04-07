const http = require('http')
const url = require('url')

require('dotenv').config()


module.exports = ({logger, configManagerService}) => {
    const serverLogger = logger('Server');

    async function handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true)
        const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')
        const method = req.method.toUpperCase()
    
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
        if (path === 'api/configurations') {
            if (method === 'GET') {
                const configs = await configManagerService.getAllConfigurations()

                sendJson(res, configs, 200)
            }else if (method === 'POST'){
                const configData = await parseBody(req)
                const config = await configManagerService.createConfiguration(configData)
                
                sendJson(res, config, 200)
            }
        }else if (path.match(/^\api\/configurations\/[^/]+$/)) {
            const id = path.split('/').pop()
    
            if (method === 'GET') {
                const config = await configManagerService.fetchConfigById(id)

                if (config) {
                    sendJson(res, config, 200)
                } else {
                    sendJson(res, { error: `Config with id: ${id} does not exist` }, 404)
                }
            }else if (method === 'PATCH'){
                const configData = await parseBody(req)
                const updatedConfig = await configManagerService.updatedConfig(id, configData)

                if (updatedConfig) {
                    sendJson(res, updatedConfig[1], 200)
                }else {
                    sendJson(res, {error: `Config with id: ${id} does not exist`}, 404)
                }

            }else if (method === 'DELETE') {
                const result = await configManagerService.deleteConfig(id)

                if (result) {
                    sendJson(res, {msg: `Successfully deleted config with id: ${id}`}, 200)
                }else {
                    sendJson(res, {error: `Config with id: ${id} does not exist`}, 404)
                }
    
            } else {
                sendJson(res, {error: "Method not allowed"}, 400)
            }
        }
    }

    async function parseBody(req) {
        const body = await new Promise((resolve) => {
            let data = ''
            req.on('data', chunk => data += chunk)
            req.on('end', () => resolve(data))
        })

        return body ? JSON.parse(body) : {};
    }
    
    function sendJson(res, data, statusCode) {
        res.statusCode = statusCode
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
    }

    function startServer() {
        return new Promise((resolve, reject) => {
            try {
                const server = http.createServer(async (req, res) => {
                    try {
                        await handleRequest(req, res)
                    } catch (err){
                        serverLogger.error(`Error handling request: ${err}`)
                    }
                })
                server.listen(process.env.PORT, () => {
                    // TODO: change hardcoded port with dynamic value
                    serverLogger.info(`Server running on port ${process.env.PORT}`)
                    resolve(server)
                })
                server.on('error', (err) => {
                    serverLogger.error(`Server error: ${err}`)
                    reject(err)
                })
            }catch(err){
                serverLogger.error(`Error starting server: ${err}`)
            }
        })
    }
    return { startServer }
}