import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        channel: {                                           // one to whom the "subscriber" is subscribing
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        subscriber: {                                        // one who is subscribing a channel
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    }, {timestamps: true}
);


export const Subscription = mongoose.model("Subscription" , subscriptionSchema);