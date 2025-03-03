import mongoose, { Schema } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productCollection = 'productosnuevos';

const ProductSchema = new Schema({
    "title": String,
    "description": String,
    "price": Number,
    "thumbnail": String,
    "code": Number,
    "stock": Number,
})

ProductSchema.plugin(mongoosePaginate)

export const productModel = mongoose.model(productCollection, ProductSchema)