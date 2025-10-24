"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./env");
const db_1 = require("./database/db");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const summary_route_1 = __importDefault(require("./routes/summary.route"));
const apiError_1 = require("./utils/apiError");
const app = (0, express_1.default)();
// Connect to the database
(0, db_1.connectDB)(env_1.config.DATABASE_URL);
// Middlewares
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// Sample route
app.get('/', (req, res) => {
    res.send('Snipnote Backend is running!');
});
app.use('/api/auth', auth_route_1.default);
app.use('/api/summary', summary_route_1.default);
app.use(apiError_1.errorHandler);
// Start the server
app.listen(env_1.config.PORT, () => {
    console.log(`Server is running on http://localhost:${env_1.config.PORT}`);
});
