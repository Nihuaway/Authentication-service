import {NextFunction,Request,Response} from "express-serve-static-core";
import {ErrorHandler} from "../ErrorHandler/ErrorHandler";
import {type} from "os";


export class ValidationHandler{
    filter: string[];
    a: number;

    constructor(filter: string[]) {
        this.filter = filter
        this.a = 30;
    }

    exist(req: Request, res: Response, next: NextFunction){
        try{
            this.filter.map(key => {
                if(req.body[key] === undefined){
                    throw new ErrorHandler(400, `Invalid input data: ${key}`)
                }
            })
            next()
        }catch (e) {
            next(e)
        }
    }
}

