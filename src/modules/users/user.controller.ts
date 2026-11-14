const userService = require("./user.service");
const { z } = require("zod");

const createUserSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email()
});

class UserController {

    async createUser(req: any, res: any) {
        try {
            const validation = createUserSchema.safeParse(req.body);

            if(!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.error.issues
                });
            }
            const user = await userService.createUser(validation.data);

            return res.status(201).json({
                success: true,
                message: "User Created successfully",
                data: user
            });
        } catch (error: any) {
            if(error.message === "USER_ALREADY_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Email already registered"
                });
            }
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Internal server Error"
            });
        }      
    }

    async getUserById(req: any, res: any) {
        try {
            const user = await userService.getUserById(req.params.userId);

            return res.status(200).json({
                success: true,
                message: "User retrived successfully",
                data: user
            })
        } catch (error: any) {
            if(error.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    sucess: false,
                    message: "User not found."
                });
            }

            console.error(error);

            return res.status(500).json({
                status: false,
                message: "Internal server"
            });
        }
    }
}

module.exports = new UserController();