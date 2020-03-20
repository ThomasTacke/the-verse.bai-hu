module.exports = {
  routePrefix: '/swagger',
  exposeRoute: true,
  swagger: {
    info: {
      title: '433 Middle Man REST API',
      description: 'testing the fastify swagger api',
      version: '1.0.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'root', description: 'Root Page.' },
      { name: 'light', description: 'Light related end points.' }
    ]
    // ,
    // securityDefinitions: {
    //     apiKey: {
    //         type: 'apiKey',
    //         name: 'apiKey',
    //         in: 'header'
    //     }
    // }
  }
}
