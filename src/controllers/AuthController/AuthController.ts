import {NextFunction,Request,Response} from "express-serve-static-core";
import {ErrorHandler} from "../../handlers/ErrorHandler/ErrorHandler";
import AuthService from "../../Services/AuthService/AuthService";
import EmailService from "../../Services/EmailService/EmailService";
import validator from "validator";
import jwt from "jsonwebtoken";

const JWT_RESTORE_SECRET: string = process.env.JWT_RESTORE_SECRET || "default_restore";
const JWT_SECRET: string = process.env.JWT_SECRET || "default";

class AuthController {
    async login(req: Request, res: Response, next: NextFunction)  {
        try{
            const {email, password} = req.body;

            if(req.cookies.token){
                jwt.verify(req.cookies.token, JWT_SECRET, {}, (err) => {
                    if(!err) throw new ErrorHandler(400, "You have been already logged in")
                })
            }

            const {token, user} = await AuthService.login(email, password);
            res.cookie("token", token);
            res.send({user});
        }catch (e) {
            if(e instanceof ErrorHandler){
                console.log("Error: ", e.message);
                res.status(e.status).send(e.message);
            }
        }
    }

    async registration(req: Request, res: Response, next: NextFunction){
        try{
            const {name, email, password} = req.body;

            if(!validator.isAlpha(name, "en-US")){
                throw new ErrorHandler(400, "Name is incorrect. It must be written in Latin");
            }

            if(!validator.isEmail(email)){
                throw new ErrorHandler(400, "Email is incorrect");
            }

            if(!validator.isStrongPassword(password)){
                throw new ErrorHandler(400, "Password is too weak");
            }

            await AuthService.registration(name, email, password);
            res.status(201).send("Your account had been created");
        }catch (e) {
            if(e instanceof ErrorHandler){
                console.log("Error: ", e.message);
                res.status(e.status).send(e.message);
            }
        }
    }

    async logout(req: Request, res: Response, next: NextFunction){
        try{
            res.clearCookie('token');
            res.sendStatus(201);
        }catch (e) {
            if(e instanceof ErrorHandler){
                console.log("Error: ", e.message);
                res.status(e.status).send(e.message);
            }
        }
    }

    async restorePassword(req: Request, res: Response, next: NextFunction) {
        try{
            const {password} = req.body;
            const {restoreToken} = req.params;

            jwt.verify(restoreToken, JWT_RESTORE_SECRET, {}, (err) => {
                if(err) throw ErrorHandler.notVerified();
            });

            if(!validator.isStrongPassword(password)){
                throw new ErrorHandler(400, "Password is too weak");
            }

            await AuthService.restorePassword(restoreToken,password);
            res.sendStatus(201);
        }catch (e) {
            if(e instanceof ErrorHandler){
                console.log("Error: ", e.message);
                res.status(e.status).send(e.message);
            }
        }
    }

    async sendRestoreLink(req: Request, res: Response, next: NextFunction) {
        try{
            const {email} = req.body;

            if(!validator.isEmail(email)){
                throw new ErrorHandler(400, "Email is incorrect");
            }

            const {restoreToken} = await AuthService.sendRestoreLink(email);
            console.log("restore token: ",restoreToken)
            const backendUrl = process.env.BACKEND_URL;
            EmailService.send(email, "Восстановление доступа", `restore link: ${backendUrl}/auth/restore/token/${restoreToken}`);
            res.sendStatus(201);
        }catch (e) {
            if(e instanceof ErrorHandler){
                console.log("Error: ", e.message);
                res.status(e.status).send(e.message);
            }
        }
    }

}

export default new AuthController();