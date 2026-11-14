const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const firestore = require("./config/firebase");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(helmet())
app.use(cors());
app.use(express.json());

const userRoutes = require("./modules/users/user.routes");
app.use("/users", userRoutes);

const chatRoutes = require("./modules/chats/chat.routes");
app.use("/chat", chatRoutes);

const userChatRoute = require("./modules/chats/user-chat.routes");
app.use("/user", userChatRoute);

const messageRoutes = require("./modules/messages/message.routes");
app.use("/chat", messageRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// {
//   "userBId": "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc",
//   "userAId": "804c824c-7771-48b4-adec-a5891e3ba261"
// }

app.get("/health", (req: any, res: any) => {
    res.status(200).json({
        success: true,
        messaging: "Chat Backend API running",
        timeStamp: new Date().toISOString()
    });
});

app.get("/health/firebase", async(req: any, res: any) => {
    try {
        await firestore.collection("_health").doc("connection").get();

        res.status(200).json({
            success: true,
            message: "Firebase Firestore connection sucessful"
        });
    } catch (error: any) {
        console.error("Firebase connection error: ", error);

        res.status(500).json({
            success: false,
            message: "Firebase firestore connection failed",
            error: error.message
        });
    }

});

module.exports = app;