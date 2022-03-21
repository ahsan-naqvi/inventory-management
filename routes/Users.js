import express from "express";
import { FindAllUsers , ProcessLogin } from '../controllers/UserController.js'

const router = express.Router();

router.get('/', FindAllUsers );
router.post('/', ProcessLogin );


export default router;