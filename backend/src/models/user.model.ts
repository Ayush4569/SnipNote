import { Schema, model,Document, Model, ClientSession } from "mongoose";

interface UserMethods {
    incrementPdfUsage:(session:ClientSession)=>Promise<this>
    canGeneratePdf:()=>boolean
}
interface user extends UserMethods, Document {
    name: string
    email: string
    picture?: string
    googleId: string
    createdAt: Date
    updatedAt: Date
    refreshToken?: string
    isPro: boolean
    pdfPerMonth :number
    pdfSummaryFile: Schema.Types.ObjectId[]
    subscriptionId ?:string
}

const userSchema = new Schema<user>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
    googleId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    refreshToken: { type: String },
    isPro: { type: Boolean, default: false },
    pdfPerMonth :{
        type:Number,
        default : 5
    },
    pdfSummaryFile: [
        {
            type: Schema.Types.ObjectId,
            ref: "Summary"
        }
    ],
    subscriptionId :String
}, { timestamps: true })

userSchema.methods.incrementPdfUsage = async function(session?:ClientSession){
    if(this.pdfPerMonth <=0) return this;
    this.pdfPerMonth -=1;
    return this.save(session ? {session} : {});   
}
userSchema.methods.canGeneratePdf = function(){
    return this.pdfPerMonth > 0;
}
export const User = model<user,Model<user,{},UserMethods>>("User", userSchema);