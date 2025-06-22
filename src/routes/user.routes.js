import { Router } from "express";
import { changePassword, getcurrentuser, login, logout, registerUser, updateUserDetailes } from "../controllers/user.controllers.js";
import {upload} from "./../middlewares/multer.middlewares.js"
import { VerifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router();

router.route('/register').post(
        upload.single('avatar'),
        registerUser
)
router.route('/login').post(login)
router.route('/logout').delete(VerifyJWT,logout)
router.route('/getcurrentuser').get(VerifyJWT,getcurrentuser)
router.route('/changepassword').put(VerifyJWT,changePassword)
router.route('/updateuserdetailes').put(
    VerifyJWT,
    upload.single('avatar'),
    updateUserDetailes
)

export default router