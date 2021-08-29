const {UserInputError, AuthenticationError} =  require("apollo-server");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require('../../config/env.json');

const createToken = async( username ) => {
    const token = jwt.sign({ username}, JWT_SECRET, { expiresIn:60 * 60 });
    return token
};

module.exports = {
    Query: {
        getUsers:async (root, args, { Message, User, context : { user} }) => {
            try {
                if(!user) throw AuthenticationError("Unauthenticated");
                let users = await User.find({ username:{$ne: user.username}});
                // const allUserMessages = await Message.find(({ $or: [{ "to" : user.username },{ "from" : user.username}]})).sort({ created_at: 1 });
                const allUserMessages =  await Message.find().or([{ to: user.username }, { from: user.username }]).sort({ created_at: "DESC" });
                users = users.map((otherUser) => {
                    const latestMessage = allUserMessages.find(m => m.to === otherUser.username || m.from === otherUser.username);
                    otherUser.latestMessage = latestMessage
                    return otherUser
                })

                return users
            } catch (error) {
                
            }
          },
          login:async (root, {username, password }, { User}) => {
                let errors = {}
                try {
                    const user = await User.findOne({username});
                    if(!user){
                        errors.username = "user not found";
                        throw new UserInputError("user not found", { errors })
                    }
                    const correctPassword =  await bcrypt.compare(password, user.password);
                    if(!correctPassword){
                        errors.password = "password is incorrect";
                        throw new UserInputError("password is incorrect", { errors })
                    }
                    user.token = createToken(username)
                    return user
                } catch (error) {
                    throw error
                }
          }
    },
    Mutation:{
        register:async (root, {username, email, password, confirm_password }, { User }) => {
            let errors = {}
            try {
                if(email.trim() === "" ) errors.email = "Email must not be empty"
                if(username.trim() === "" ) errors.username = "Username must not be empty"
                if(password.trim() === "" ) errors.password = "Password must not be empty"
                if(confirm_password.trim() === "" ) errors.confirm_password = "Confirm Password must not be empty"
                if(password !== confirm_password ) errors.confirm_password = "Passwords dont match"

                const userNameExists = await User.findOne({username})
                const userEmailExists = await User.findOne({email})

                if(userNameExists) errors.username = "Username is taken"
                if(userEmailExists) errors.email = "Email is taken"

                if(Object.keys(errors).length > 0) throw errors
                return await new User({username, email, password}).save();
            } catch (error) {
                throw new UserInputError("Bad input", { errors })
            }
        }
    }
}