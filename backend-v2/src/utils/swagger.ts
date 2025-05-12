import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Wallet Tracker API",
    version: "1.0.0",
    description: "This is the API documentation for the Wallet Tracker application",
  },
  servers: [
    {
      url: `${process.env.BASE_URL || "http://localhost:8000"}`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  cache: false,
  apis: ["./src/routes/**/*.ts", "./src/controllers/**/*.ts", "./src/middlewares/**/*.ts"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: any) => {
  app.use("/api/v2/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
