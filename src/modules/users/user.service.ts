const userRepository = require ("./user.repository");

class UserService {
    async createUser(data: {name: string; email: string}){
        const existingUser = await userRepository.findUserByEmail(data.email);

        if(existingUser) {
            throw new Error("USER_ALREADY_EXISTS");
        }

        return await userRepository.createUser(data);
    }

    async getUserById(userId: string) {
        const user = await userRepository.findUserById(userId);

        if(!user) {
            throw new Error("USER_NOT_FOUND");
        }

        return user;
    }
}

module.exports = new UserService();