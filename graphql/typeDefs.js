const { ApolloServer, gql } = require('apollo-server');


module.exports =  gql`
    scalar Date
    type User{
        username:String!,
        email:String!
        created_at:Date
        token:String
        image_url:String
        latestMessage:Message
    }

    type Message{
        uuid:String!
        content:String!
        from:String!
        to:String
        created_at:Date
        reaction:[Reaction]
    }

    type Reaction{
        uuid:String!
        content:String!
        message:Message
        user:User
        created_at:Date
    }

    type Query {
        getUsers:[User]!
        login(username:String!, password:String!):User!
        getMessages(from:String!):[Message]!
    }
    
    type Mutation {
        register(username:String!, email:String!, password:String!, confirm_password:String!):User!
        sendMessage(to:String!, content:String!):Message
        reactToMessage(uuid:String!, content:String!):Reaction
    }
    type Subscription {
        newMessage:Message!   
        newReaction:Reaction!   
    }
`;