import { Router } from "express";
import { VerifyJWT } from "../middlewares/auth.middlewares.js";
import { createToDo, deleteToDo, getAllToDo, toggleCompletedtodo, updateToDo } from "../controllers/todo.contrllers.js";

const router=Router();

router.route('/createtodo').post(VerifyJWT,createToDo);
router.route('/updatetodo/:todoId').put(VerifyJWT,updateToDo);
router.route('/deletetodo/:todoId').delete(VerifyJWT,deleteToDo);
router.route('/getalltodo').get(VerifyJWT,getAllToDo);
router.route('/toggletodo/:todoId').put(VerifyJWT,toggleCompletedtodo);

export default router