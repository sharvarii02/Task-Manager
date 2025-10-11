import express from "express";
import authMiddleware from "../middleware/auth.js";
import { createTask, deleteTask, getTaskId, getTasks, updateTask } from "../controllers/taskController.js";

const taskRouter=express.Router();
taskRouter.route('/gp')
 .get(authMiddleware,getTasks)
 .post(authMiddleware,createTask);

taskRouter.route('/:id/gp')
.get(authMiddleware,getTaskId)
.put(authMiddleware,updateTask)
.delete(authMiddleware,deleteTask)

export default taskRouter;