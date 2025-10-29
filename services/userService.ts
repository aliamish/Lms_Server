import { NextFunction, Response } from "express"
import { redis } from "../utils/redis"
import userModel from "../models/userModel"


// GET USER BY ID
export const getUserById = async (id: string, res: Response) => {
    const userJson = await redis.get(id)
    if (userJson) {
        const user = JSON.parse(userJson)
        res.status(201).json({
            success: true,
            user
        })
    }
}

// GET ALL USERS 
export const getAllUsersService = async (res: Response) => {
    const users = await userModel.find().sort({ createdAt: -1 })
    res.status(201).json({
        success: true,
        users
    })
}

//UPDATAE USER ROLE
export const updateUserRoleService = async (res: Response, id: string, role: string) => {
  const user = await userModel.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  );

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
