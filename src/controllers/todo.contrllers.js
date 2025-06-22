import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Todo} from "./../models/todo.models.js";
import {asyncHandler} from "./../utils/AsyncHandler.js"

//? EndPoint for todo
// TODO :- 1> createToDo
// TODO :- 2> updateToDo
// TODO :- 3> deleteToDo
// TODO :- 4> getAllToDo
// TODO :- 5> toggleCompletedtodo

const createToDo=asyncHandler(async(req,res)=>{
    try {
        //!get the data from req.body
        //!validate fields not empty
        //!create a dataBase call for create post
        //! return response

        const {title,description}=req.body;
        const userID=req.user?._id;

        if(!(title || description)){
            throw new ApiError(400,"All fields are required!")
        }

        const todo=await Todo.create({
            title,
            description,
            owner:userID
        })
        await todo.save;

        if(!todo){
            throw new ApiError(504,"DataBase Error !! failed to create post")
        }
        return res.status(201)
        .json(
            new ApiResponse(200,todo,"Todo created successfuly")
        )
        
    } catch (error) {
        res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const updateToDo=asyncHandler(async(req,res)=>{
    try {
        //! get the data from req.body
        //! validate the fields not empty
        //! validate user 
        //! update todo
        //! return response
        
        const {title,description}=req.body;
        const {todoId}=req.params;
        const userID=req.user?._id;
        if(!(title || description)){
            throw new ApiError(401,"All fields are required!!")
        }
        if(!isValidObjectId(userID)){
            throw new ApiError(404,"userID is invalid or not authorized");
        }
        if(!isValidObjectId(todoId)){
            throw new ApiError(404,"Invalid TodoId ! please provide valid ID");
        }
        const todo=await Todo.findById(todoId);

        if(!todo){
            throw new ApiError(404,"Todo not found to update")
        }

        if(todo?.owner.toString().toLocaleLowerCase() !== userID.toString().toLocaleLowerCase()){
            throw new ApiError(403,"You can only update your own todo")
        }
       
        const updatedTodo=await Todo.findByIdAndUpdate(
            todoId,
            {
                title,
                description
            },
            {
                new:true
            }
        )
        if(!updatedTodo){
            throw new ApiError(505,"Database error failed to update todo");
        }

        return res.status(200)
        .json(
            new ApiResponse(200,updatedTodo,"Todo updated successfuly")
        )
    } catch (error) {
         res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const deleteToDo=asyncHandler(async(req,res)=>{
    try {
        //!get the todoId from req.params
        //!vaidate todoId and userID and user
        //!delete the todo and return the response
        const {todoId}=req.params;
        const userID=req.user?._id;
        if(!isValidObjectId(todoId)){
            throw new ApiError(400,"invalid todo Id");
        }
        if(!isValidObjectId(userID)){
            throw new ApiError(400,"Invalid userID or unAuthorized user");
        }

        const todo=await Todo.findById(todoId);

        if(!todo){
            throw new ApiError(404,"Todo not found");
        }

        if(todo?.owner.toString().toLocaleLowerCase() !== userID?.toString().toLocaleLowerCase()){
            throw new ApiError(403,"You can only delete your own todo")
        }

        const deletedTodo=await Todo.findByIdAndDelete(
            todoId,
            {new:true}
        )
        if(!deletedTodo){
            throw new ApiError(500,"DataBase Error !! failed to delete todo")
        }
        return res.status(200)
        .json(
            new ApiResponse(200,deletedTodo,"Todo deleted successfuly")
        )
    } catch (error) {
        res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const getAllToDo=asyncHandler(async(req,res)=>{
    try {
        const userID=req.user?._id;
        if(!isValidObjectId(userID)){
            throw new ApiError(400,"Invalid userID or unauthorized user")
        }

        const todo=await Todo.aggregate([
            {
                $match:{owner:userID}
            },
           {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"TodosList"
            }
           },
            {
                $project:{
                    title:1,
                    description:1,
                    isCompleted:1,
                    owner:{
                        $arrayElemAt:['$TodosList',0]
                    }
                }
            }
        ])

        if(!todo?.length){
            throw new ApiError(500,"Failed to get Todos")
        }
        return res.status(200).json(
            new ApiResponse(200,todo,"todos fetched successfuly")
        )
    } catch (error) {
         res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

const toggleCompletedtodo=asyncHandler(async(req,res)=>{
    try {
        const {todoId}=req.params;
        const userID=req.user?._id;
         if(!isValidObjectId(todoId)){
            throw new ApiError(400,"invalid todo Id");
        }
        if(!isValidObjectId(userID)){
            throw new ApiError(400,"Invalid userID or unAuthorized user");
        }

        const todo=await Todo.findById(todoId);

        if(!todo){
            throw new ApiError(404,"Todo not found");
        }

        if(todo?.owner.toString().toLocaleLowerCase() !== userID?.toString().toLocaleLowerCase()){
            throw new ApiError(403,"You can only toggle your own todo")
        }
        
        todo.isCompleted=!todo.isCompleted;
        await todo.save({validateBeforeSave:false})

        return res.status(200)
        .json(
            new ApiResponse(200,todo,"Todo completed successfuly")
        )

    } catch (error) {
         res.status(500).json(
            {
                message:`${error}`
            }
        )
    }
})

export {
    createToDo,
    updateToDo,
    deleteToDo,
    getAllToDo,
    toggleCompletedtodo
}