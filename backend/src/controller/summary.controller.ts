import {Request,Response}from 'express';
import { CustomError } from 'utils/apiError';
import {PDFParse} from 'pdf-parse';
import { asyncHandler } from 'utils/asyncHandler';
const generateSummary = asyncHandler(async(req:Request,res:Response)=>{
  if(!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const {fileUrl} = req.body;

  try {
    const file = await fetch(fileUrl)
    const arrayBuffer = await file.arrayBuffer()

    const pdfData = new PDFParse('')
  } catch (error) {
    console.log('error generating summary',error);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
  }

})
const getSummary = asyncHandler(async(req:Request,res:Response)=>{

})
const deleteSummary = asyncHandler(async(req:Request,res:Response)=>{

})