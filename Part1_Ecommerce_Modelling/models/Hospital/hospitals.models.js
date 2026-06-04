import mongoose from "mongoose";

const hospitalsSchema = new mongoose.Schema(
    {
        hospitalName: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        }
        
    }, {timestamps: true}
);

export const Hospitals = mongoose.model("Hospitals" , hospitalsSchema);