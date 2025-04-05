const http = require('http')
const url = require('url')


module.exports = ({logger}) => {
    const serverLogger = logger('Server');

    function startServer() {
        return new Promise((resolve, reject) => {
            try {
                const server = http.createServer(async (req, res) => {
                    try {
                        await handleRequest(req, res)
                    } catch (err){
                        serverLogger.error('Error handling request: ', err)
                    }
                })
                server.listen(3000, () => {
                    // TODO: change hardcoded port with dynamic value
                    serverLogger.info('Server running on port 3000')
                    resolve(server)
                })
                server.on('error', (err) => {
                    serverLogger.error('Server error: ', err)
                    reject(err)
                })
            }catch(err){
                serverLogger.error('Error starting server: ', err)
            }
        })
    }
    return { startServer }
}

async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true)
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')
    const method = req.method.toUpperCase()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (path === 'api/configurations') {
        if (method === 'GET') {
            // TODO: get all configs
            sendJson(res, {}, 200)
        }else if (method === 'POST'){
            // TODO: parse body 
            // TODO: create config
            sendJson(res, {}, 200)
        }
    }else if (path.match(/^\api\/configurations\/[^/]+$/)) {
        const id = path.split('/').pop()

        if (method === 'GET') {
            // TODO: get specific config by id
            // TODO: check if config exists and handle appropriatly
            sendJson(res, {}, 200)
        }else if (method === 'PUT'){
            // TODO: parse data from body
            // TODO: update config
            sendJson(res, {}, 200)
        }else if (method === 'DELETE') {
            // TODO: delete config

            sendJson(res, {}, 200)
        } else {
            sendJson(res, {error: "Method not allowed"}, 400)
        }
    }
}

function sendJson(res, data, statusCode) {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
}