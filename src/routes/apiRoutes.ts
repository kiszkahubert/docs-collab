import {Request, Response, Router} from "express";
import {verifyToken} from "../middleware/authMiddleware";

const router = Router();

router.get('/validate',verifyToken as any,(req: Request, res: Response)=>{
    res.sendStatus(200);
});

export default router;