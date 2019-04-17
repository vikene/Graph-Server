import {MongoClient, ObjectID} from 'mongodb'
import {makeExecutableSchema} from 'graphql-tools'
import {graphiqlExpress, graphqlExpress} from 'graphql-server-express'
import express from 'express';
import * as bodyParser from 'body-parser';

export const start = async () => {
    try{
        const MONGOURL = "mongodb://localhost:27017/blog"
        const db = await MongoClient.connect(MONGOURL)
        const user = db.collection("User")
        const post = db.collection("Post")
        const comment = db.collection("Comment")
        const prepare = (o) => {
            o._id = o._id.toString()
            return o
        }
        const typeDefs = [`
            type User{
                _id: String
                email: String
                username: String
                profileImage: String
                posts: [Post]
                comments: [Comment]
            }
            type Post{
                _id: String
                title: String
                content: String
                tag: [String]
                comment: [Comment]
                userId: String
                user: User
            }
            type Comment{
                _id: String
                postId: String
                content: String
                userId: String
                post: Post
                user: User
            }
            type Query{
                post(_id: String): Post
                posts: [Post]
                comment(_id: String): Comment
                user(_id: String): User
                listUsers: [User]
            }
            type Mutation{
                createUser(email: String, username: String, profileImage: String): User
                createPost(title: String, content: String, tag: [String], userId: String): Post
                createComment(postId: String, content: String, userId: String): Comment
                deleteUser(_id: String): String
            }
            schema{
                query: Query
                mutation: Mutation
            }
        `]
        const resolvers = {
            Query: {
                post: async (root, {_id}) =>{
                    return prepare(await post.findOne(ObjectID(_id)))
                },
                posts: async () => {
                    return (await post.find({}).toArray()).map(prepare)
                },
                comment: async (root, {_id}) => {
                    return prepare(await comment.findOne(ObjectID(_id)))
                },
                user: async (root, {_id}) => {
                    return prepare(await user.findOne(ObjectID(_id)))
                },
                listUsers: async () => {
                    return (await user.find({}).toArray()).map(prepare)
                    
                }
            },
            User: {
                posts: async ({_id}) => {
                    return (await post.find({userId: _id}).toArray()).map(prepare)
                },
                comments: async ({_id}) => {
                    return (await comment.find({userId: _id}).toArray()).map(prepare)
                }
            },
            Post: {
                user: async ({userId}) => {
                    return prepare(await user.findOne({_id: ObjectID(userId)}))
                },
                comment: async ({_id}) => {
                    return (await comment.find({postId: _id}).toArray()).map(prepare)
                }
            },
            Comment: {
                user: async ({userId}) => {
                    return prepare(await user.findOne(ObjectID(userId)))
                },
                post: async ({postId}) => {
                    return prepare(await post.findOne(ObjectID(postId)))
                }
            },
            Mutation:{
                createUser: async (root, args)=>{
                    const res = await user.insert(args)
                    return prepare(await user.findOne(ObjectID(res.insertedIds[0])))
                },
                createPost: async (root, args) => {
                    const res = await post.insert(args)
                    return prepare(await post.findOne(ObjectID(res.insertedIds[0])))
                },
                createComment: async (root, args) => {
                    const res = await comment.insert(args)
                    return prepare(await comment.findOne(ObjectID(res.insertedIds[0])))
                },
                deleteUser: async (root, args) => {
                    const res =  await user.deleteOne({_id: ObjectID(args._id)})
                    return "Done"
                }
            }
        }
        const schema = makeExecutableSchema({
            typeDefs,
            resolvers
        })
        const app = express()
        app.use("/graphql",bodyParser.json(), graphqlExpress({schema}))
        app.use("/graphiql", graphiqlExpress({
            endpointURL: "/graphql"
        }))

        app.listen(3000, function(err){
            if(err){
                console.log("ERROR")
            }
            console.log("LISTENING")
        })
    }
    catch(e){
        console.log(e)
    }
}