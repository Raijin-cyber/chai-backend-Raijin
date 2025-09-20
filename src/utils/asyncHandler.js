// building a wraper function. This function wraps any function in then catch async await
const asyncHandler = (fn) => {
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
        .catch((error) => next(error))
    }
}

export { asyncHandler };

// building a wraper function. This function wraps any function in try catch async await
// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message,
//         })
//     }
// }