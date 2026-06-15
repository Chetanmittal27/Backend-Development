const asyncHandler = (func) => async (req , res) => {

    try{
        await func(req , res);
    }
    catch(error){
        res.status(Number(error.code) || 500).json({
            success: false,
            message: error.message
        })
    }
}


export {asyncHandler}