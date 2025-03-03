
import mongoose from "mongoose"

export const mongoConnection = async () => {
    try{
        
        await mongoose.connect(process.env.MONGO_URL, {dbName: 'Ecommerce'})
        console.log('BBDD conectada')
    } catch (e) {
        console.log(e)
        console.log (process.env.MONGO_URL)
        console.log('Error al conectarse a  BBDD')
    }
        
}

