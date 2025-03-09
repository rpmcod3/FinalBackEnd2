import mongoose, { Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productCollection = 'products';

const ProductSchema = new Schema(
    {
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
},
{ timestamps: true });

ProductSchema.plugin(mongoosePaginate)

export const ProductsModel = mongoose.model(productCollection, ProductSchema)

