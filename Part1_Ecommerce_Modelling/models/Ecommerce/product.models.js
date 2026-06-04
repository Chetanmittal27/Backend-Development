import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        productImages: {
            type: String,
            required: true
        },

        stock: {
            type: Number,
            default: 0
        },

        productCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        ownership: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    }, {timestamps: true}
)


export const Product = mongoose.model("Product" , productSchema);