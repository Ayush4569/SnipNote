"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async (DATABASE_URL) => {
    try {
        const connectionInstance = await mongoose_1.default.connect(DATABASE_URL);
        console.log("Database connected successfully", connectionInstance.connection.name);
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
