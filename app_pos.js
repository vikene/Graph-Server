import { MongoClient, ObjectID} from "mongodb";
import {graphiqlExpress, graphqlExpress} from "graphql-server-express";
import {makeExecutableSchema} from "graphql-tools";
import express from "express";
import * as bodyParser from "body-parser";

export const start = async () => {
    try{
        const MONGOURL = "mongodb://localhost:27017/posApplication"
        const db = await MongoClient.connect(MONGOURL)
        const user = db.collection("User")
        const products = db.collection("Products")
        const transactions = db.collection("Transactions")
        const prepare = (o) => {
            o._id = o._id.toString()
            return o
        }
        const typeDefs = [
            `
            type User{
                _id: String
                email: String
                phone: String
                password: String
                products: [Products]
                transactions: [Transactions]
            }
            type Products{
                _id: String
                productname: String
                productprice: Float
                productcount: Float
                userId: String
                user: User
            }
            type Transactions{
                _id: String
                date: String
                time: String
                totalprice: Float
                tax: Float
                paymentmethod: String
                userId: String
                items: [String]
            }
            type Query{
                getuser(email: String): User
                getuserId(_id: String): User
                getproducts(userId: String): [Products]
                gettransaction(userId: String): [Transactions]
            }
            type Mutation{
                createUser(email: String, phone: String, password: String): User
                createProducts(productname: String, productprice: Float, productcount: Float, userId: String): Products
                createTransactions(data: String, time: String, totalprice: Float, tax: Float, paymentmethod: String, userId: String, items: [String]): Transactions
            }
            type schema{
                query: Query
                mutation: Mutation
            }
        `
        ]

        const resolvers = {
            Query: {
                getuser: async (root, {email}) => {
                        return prepare(await user.findOne({email: email}))
                },
                getuserId: async (root, {_id}) => {
                    return prepare(await user.findOne(ObjectID(_id)))
                },
                getproducts: async (root, {userId}) => {
                    return (await products.find({userId: userId}).toArray()).map(prepare)
                },
                gettransaction: async (root, {userId}) => {
                    return (await transactions.find({userId: userId}).toArray()).map(prepare);
                }
            },
            User: {
                products: async ({_id}) => {
                    console.log(_id)
                    return (await products.find({userId: _id}).toArray()).map(prepare);
                }
            },
            Mutation: {
                createUser: async (root, args) => {
                    const res = await user.insert(args);
                    return prepare(await user.findOne(ObjectID(res.insertedIds[0])))
                },
                createProducts: async (root, args) => {
                    const res = await products.insert(args);
                    return prepare(await products.findOne(ObjectID(res.insertedIds[0])));
                },
                createTransactions: async (root, args)=>{
                    const res = await transactions.insert(args);
                    return prepare(await transactions.findOne(ObjectID(res.insertedIds[0])));
                }
            }
        }

        const schema = makeExecutableSchema({
            typeDefs,
            resolvers
        }
        )

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




