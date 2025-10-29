"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleService = exports.getAllUsersService = exports.getUserById = void 0;
const redis_1 = require("../utils/redis");
const userModel_1 = __importDefault(require("../models/userModel"));
// GET USER BY ID
const getUserById = async (id, res) => {
    const userJson = await redis_1.redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(201).json({
            success: true,
            user
        });
    }
};
exports.getUserById = getUserById;
// GET ALL USERS 
const getAllUsersService = async (res) => {
    const users = await userModel_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        users
    });
};
exports.getAllUsersService = getAllUsersService;
//UPDATAE USER ROLE
const updateUserRoleService = async (res, id, role) => {
    const user = await userModel_1.default.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User  found",
        });
    }
    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user,
    });
};
exports.updateUserRoleService = updateUserRoleService;
//# sourceMappingURL=userService.js.map