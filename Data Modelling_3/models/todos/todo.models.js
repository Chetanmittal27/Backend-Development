import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        completed: {
            type: Boolean,
            default: false
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        subTodo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubTodos"
            }
        ]
    }, {timestamps: true}
)

export const Todo = mongoose.model("Todo" , todoSchema);