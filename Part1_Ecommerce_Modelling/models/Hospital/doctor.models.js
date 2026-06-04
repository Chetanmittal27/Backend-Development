import mongoose, { mongo } from 'mongoose';

const hospitalHoursSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        hours: {
            type: Number,
            required: true
        }
    }
);


const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        qualification: {
            type: String,
            required: true
        },

        salary: {
            type: Number,
            required: true
        },

        experienceInYears: {
            type: Number,
            default: 0
        },

        worksInHospitals: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hospitals"
            }
        ],

        eachHospitalHours: {
            type: [hospitalHoursSchema],
            required: true
        }
    } , {timestamps: true}
);


export const Doctor = mongoose.Schema("Doctor" , doctorSchema);