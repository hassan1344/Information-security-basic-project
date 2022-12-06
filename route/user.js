import { signup, login,previewAll,previewLoggedin,resetAnyUserPass,resetPassByADmin,resetLoggedInpass,resetPassByuser,verifyUser } from "../controllers/user.js";
import express, { Router } from "express";

//initialise the router
const router = Router();


router.post('/login', login);
// router.post('/forgetpassword',forgetPassword);


//get all transactions

//create transaction route
router.post('/signup', signup);
router.get('/previewall', previewAll)
router.get('/loggedin', previewLoggedin)
router.get('/respassany',resetAnyUserPass)
router.post('/resetpassbyadmin', resetPassByADmin)
router.get('/resetloggedin', resetLoggedInpass)
router.post('/resetpassbyuser',resetPassByuser)
router.post('/verifyuser',verifyUser )


//get transaction history of an user

export default router;
