import {IAuthController} from "./IAuthController";
import {NextFunction,Request,Response} from "express-serve-static-core";
import {ErrorHandler} from "../../handlers/ErrorHandler/ErrorHandler";
import AuthService from "../../Services/AuthService/AuthService";
import EmailService from "../../Services/EmailService/EmailService";

class AuthController implements IAuthController{
    async login(req: Request, res: Response, next: NextFunction)  {
        try{
            const {email, password} = req.body;
            if(req.cookies['token']){
                throw new ErrorHandler(400, "You have been already logged in")
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
            await AuthService.registration(name, email, password);
            res.status(201).send("Your account had been created");
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

            const {restoreToken} = await AuthService.sendRestoreLink(email);
            console.log("restore token: ", restoreToken);
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