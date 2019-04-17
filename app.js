import {MongoClient, ObjectID} from 'mongodb'
import {makeExecutableSchema} from 'graphql-tools'
import {graphiqlExpress, graphqlExpress} from 'graphql-server-express'
import express from 'express';
import * as bodyParser from 'body-parser';

export const start = async () => {
    try{
            const typeDefs = [`
            type Post{
                _id: String
                title: String
                content: String
                comments: [Comment]
            },
            type Comment{
                _id: String
                postId: String
                content: String
                post: Post
            }
            type Query{
                post(_id: String): Post
                posts: [Post]
                comment(_id:String): Comment
            }
            type Mutation{
                createPost(title: String, content: String): Post
                createComment(postId: String, content: String): Comment
            }
            schema{
                query: Query
                mutation: Mutation
            }
        `
        ]
        const MongoURL = 'mongodb://localhost:27017/blog'
        const db =  await MongoClient.connect(MongoURL)
        const Posts = db.collection("posts")
        const Comments = db.collection("comments")
        const prepare = (o) =>{ 
            console.log(o)
            o._id = o._id.toString();
            return o;
        }
        const resolvers = {
            Query : {
                post: async (root, {_id}) => {
                    return prepare(await Posts.findOne(ObjectID(_id)))
                },
                posts: async () =>{
                    return (await Posts.find({}).toArray()).map(prepare)
                },
                comment: async (root, {_id}) => {
                    return prepare(await Comments.findOne(ObjectID(_id)))
                }
            },
            Post: {
                comments: async ({_id}) => {
                    return (await Comments.find({postId: _id}).toArray()).map(prepare)
                }
            },
            Comment: {
                post: async({postId})=> {
                    return prepare(await Posts.findOne(ObjectID(postId)))
                }
            },
            Mutation :{
                createPost: async(root, args, context, info) =>{
                    const res = await Posts.insert(args)
                    console.log(res)
                    return prepare(await Posts.findOne({_id: ObjectID(res.insertedIds[0])}))
                },
                createComment: async(root, args)=>{
                    const res = await Comments.insert(args)
                    return prepare(await Comments.findOne({_id:res.insertedIds[0]}))
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
