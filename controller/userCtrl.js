const bodyParser = require("body-parser");
const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require ("jsonwebtoken");


const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        //create new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else {
        throw new Error("User Already Exists");

    }

});

const loginUserCtrl = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    // check if user exists
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(findUser._id,{
            refreshToken: refreshToken,

        },
        {new:true});
        res.cookie("refreshToken",refreshToken, {
            httpOnly: true,
            maxAge:72 * 60 * 60 * 1000,

        });
        res.json({
            id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    }
    else {
        throw new Error("Invalid Credentials");
    }
});

//handle refresh token

const handleRefreshToken = asyncHandler(async(req, res) => {
const cookie = req.cookies;
if(!cookie?.refreshToken) throw new Error("No refresh token");
const refreshToken = cookie.refreshToken;
const user = await User.findOne({refreshToken});
if(!user) throw new Error ("No refresh token");
jwt.verify(refreshToken,process.env.JWT_SECRET,(err, decoded) => {
    if (err || user.id !== decoded.id){
        throw new Error ("Refresh token error");
    }
    const accessToken = generateToken(user?._id)
    res.json({accessToken});

});

});

//logout function

const logout = asyncHandler(async(req,res) =>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh token");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true,
    });
    res.sendStatus(204);
    }
    await User.findOneAndUpdate({ refreshToken: refreshToken }, { refreshToken: "" });

    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true,
    });
     res.sendStatus(204);
});


//Update a user
const updateaUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDBId(_id);
    try {
        const updateaUser = await User.findByIdAndUpdate(_id, {

            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,

        }, {
            new: true,
        });
        res.json(updateaUser);
    }
    catch (error) {
        throw new Error("error");
    }

});


// Get all users

const getallUser = asyncHandler(async (req, res) => {
    
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch (error) {
        throw new Error("error");
    }


});

//get a single user

const getaUser = asyncHandler(async (req, res) => {

    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    }
    catch (error) {
        throw new Error("error");
    }
})

const deleteaUser = asyncHandler(async (req, res) => {

    const { id } = req.params;
    validateMongoDBId(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    }
    catch (error) {
        throw new Error("error");
    }
});

const blockUser = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    validateMongoDBId(id);
    try{
        const block = await User.findByIdAndUpdate(
            id,
            {
            isBlocked: true,
            },
            {
                new: true,
            }
            );
            res.json({
                message:"User blocked",

    });
    }
    catch (error){
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    validateMongoDBId(id);
    try{
        const unblock = await User.findByIdAndUpdate(
            id,
            {
            isBlocked: false,
            },
            {
                new: true,
            }
            );
            res.json({
                message:"User unblocked",});
    }
    catch (error){
        throw new Error(error);
    }
});


module.exports = { 
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getaUser, 
    deleteaUser, 
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,

  };
