
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Node.js Chat Backend API",
            version: "1.0.0",
            description: "Chat backend using Node.js, TypeScript, PostgreSQL and Firebase Firestore"
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: "Local development server"
            }
        ]
    },
    apis: ["./src/modules/**/*.ts", "./src/app.ts"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
