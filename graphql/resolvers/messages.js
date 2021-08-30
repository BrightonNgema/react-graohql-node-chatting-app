const {UserInputError, AuthenticationError,ForbiddenError ,withFilter} =  require("apollo-server");

module.exports = {
    Query:{
        getMessages:async (root, {from}, { Message,User,Reaction, context : { user } }) => {
            try {
                if(!user) throw new AuthenticationError("Unauthenticated");

                const otherUser =  await User.findOne({username:from});
                if(!otherUser) throw new UserInputError("User not found");
                const usernames = [user.username, otherUser.username]
                const messages = await Message.find(({ from: { "$in" : usernames}, to: { "$in" : usernames}})).sort({ created_at: 'DESC' })
                return messages
            } catch (error) {
                throw error
            }
        }
    },
    Mutation:{
        sendMessage:async (root, {to, content}, { Message,User, context : { user,pubsub } }) => {
            try {
                if(!user) throw new AuthenticationError("Unauthenticated");
                    const recipient =  await User.findOne({username:to});
                if(!recipient){
                    throw new UserInputError("User not found");
                }else if(recipient.username === user.username){
                    throw new UserInputError("You cant message yourself");
                }
                if(content.trim() === "") throw new UserInputError("Message is empty");

                const message = await new Message({ 
                    from:user.username,
                    to,
                    content
                }).save();
                pubsub.publish('NEW_MESSAGE',{newMessage:message})
                 return message
            } catch (error) {
                throw new UserInputError(error)
            }
        },
        reactToMessage: async (root, {uuid, content}, { Message,User,Reaction, context : { user,pubsub } }) => {
            const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
            try {
                if(!reactions.includes(content)){
                    throw new UserInputError("Invalid Reaction")
                }
                const username = user ? user.username : ''
                user = await User.findOne({username});
                if(!user) throw new AuthenticationError("Unauthenticated");

                const message = await Message.findOne({uuid})
                if(!message) throw new UserInputError("Message Not Found");

                if(message.from !== user.username && message.to !== user.username){
                    throw new ForbiddenError('Unauthenticated')
                }
                let reaction = await Reaction.findOne({message:message._id, user:user._id})
                if(reaction){
                    reaction.content = content
                    await Reaction.updateOne({message:message._id, user:user._id},{
                        content:reaction.content
                      }, { new: true })
                }else{
                    reaction =  await new Reaction({
                        message:message._id,
                        user:user._id,
                        content
                    }).save()
                }
                const reactedMessage = await Message.findOne({uuid,reaction:reaction._id});
                if(!reactedMessage){
                    await Message.updateOne({uuid},{reaction:[...message.reaction,reaction._id]})
                }
                pubsub.publish('NEW_REACTION',{newReaction:reaction})
                return reaction
            } catch (error) {
                throw error
            }
        }
    },
    Subscription:{
        newMessage:{
            subscribe:withFilter((_, __, {context : { user, pubsub } }) => {
                console.log(user)
                // if(!user) {
                //     throw new AuthenticationError("Unauthenticated new");
                // }
                return pubsub.asyncIterator('NEW_MESSAGE') 
            }, ({newMessage}, _,{context : { user, pubsub }}) =>{
                if(newMessage.from === user.username || newMessage.to === user.username ){
                    return true
                }
                return false
            })
        },
        newReaction:{
            subscribe:withFilter((_, __, {context : { user, pubsub } }) => {
                if(!user) {
                    throw new AuthenticationError("Unauthenticated");
                }
                return pubsub.asyncIterator('NEW_REACTION') 
            }, ({newReaction}, _,{context : { user, pubsub }}) =>{
                if(newReaction.message.from === user.username || newReaction.message.to === user.username ){
                    return true
                }
                return false
            })
        }
    }
}