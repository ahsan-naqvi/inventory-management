import UserModel from "../models/UserModel.js";
// import bcrypt from "bcryptjs"; //password hashing library
import jsonwebtoken from 'jsonwebtoken'; //json web token library
// import { check, validationResult } from 'express-validator'; //express js middleware uses validator js

var jwtSecret = "mysecrettoken";

export const FindAllUsers = async (req,res) =>{
    try {
        const UserList = await UserModel.find();
        res.status(200).json(UserList);

    } catch (error) {
        res.status(404).json({message: error.message });
    }
}

export const ProcessLogin = async (req,res) =>{
    const userReqObj = req.body;    

    try {
        var userInDb = await UserModel.findOne({Username: userReqObj.Username});
        if(userInDb != null)
        {
            if(userInDb.Status == "A")
            {
                if(userInDb.Password == userReqObj.Password){                
                    const payload = {
                        user: {
                            id: userInDb._id
                        }
                    }

                   jsonwebtoken.sign(payload,jwtSecret, {expiresIn: 30000 }, (err,t) => {
                        if(err){
                            throw err;                            
                        }
                        console.log(t);
                        res.status(201).json({ message: "User Authenticated.", isLoginSuccess: true, token: t });
                    });
                }
                else{                
                    res.status(201).json({ message: "Wrong! username or password.", isLoginSuccess: false });
                }
            }
            else
            {
                res.status(201).json({ message: "This User is not active.", isLoginSuccess: false });
            }
        }
        else{
            res.status(201).json({ message: "Wrong! username or password.", isLoginSuccess: false });
        }
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}