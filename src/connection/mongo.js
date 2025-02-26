
import mongoose from "mongoose"

import dotenv from "dotenv";

dotenv.config();



export const mongoConnection = async () => {
    try{
        
        await mongoose.connect(process.env.MONGO_URL, {dbName: 'DDBB_Ecommerce'})
        console.log('BBDD conectada')
    } catch (e) {
        console.log(e)
        console.log (process.env.MONGO_URL)
        console.log('Error al conectarse a  BBDD')
    }
        
}

