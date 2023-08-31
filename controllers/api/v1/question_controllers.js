
const Question = require('../../../models/question');
const Option = require('../../../models/option');


/**
 * create a question 
 * takes the title from body of request
 * check if question is already exist or not
 * if question is not already exist we create a question with given title
 */
// Define the create function as an async function


module.exports.create = async function (req, res) {
    try {
        // Extract the 'title' property from the request body
        const { title } = req.body;

        // Check if the 'title' data is missing
        if (!title) {
            // If 'title' is missing, return a 400 response indicating its requirement
            return res.status(400).json({
                message: 'Title is required',
                status: 'failure',
                data: []
            });
        }

        // Check if a question with the same title already exists
        const existingQuestion = await Question.findOne({ 'title': title });

        if (existingQuestion) {
            // If a question with the same title exists, return a 401 response
            return res.status(401).json({
                message: 'Question already exists',
                status: 'failure',
                data: [{ id: existingQuestion._id }]
            });
        }

        // If no existing question found, create a new question with the given title
        const question = await Question.create({ 'title': title });

        // Return a 200 response with the created question's details
        return res.status(200).json({
            message: 'Question created',
            status: 'successful',
            data: [question]
        });
    } catch (error) {
        // If an error occurs during the process, log the error and return a 500 response
        console.log('ERROR CREATING QUESTION: ', error);
        return res.status(500).json({
            message: 'Internal server error',
            status: 'failure',
            data: []
        });
    }
}

/**
 * delete a question
 * takes question id from request parameters
 * check if question id is valid or not
 * if id is valid we first delete all the options of question and then delete question from db
 */



// Define the delete function
module.exports.delete = async function (req, res) {
    try {
        // Get the question ID from URL parameters
        const questionId = req.params.id;

        // Check if the question ID is missing
        if (!questionId) {
            return res.status(404).json({
                message: 'Empty Question id',
                status: 'failure',
                data: []
            });
        }

        // Find the question by its ID
        const question = await Question.findById(questionId);

        // Check if the question exists
        if (!question) {
            return res.status(404).json({
                message: 'Invalid Question id',
                status: 'failure',
                data: []
            });
        }

        // Delete associated options using their IDs stored in the question's options array
        await Option.deleteMany({ '_id': { $in: question.options } });

        // Delete the question
        await Question.findByIdAndDelete(questionId);

        // Return success response
        return res.status(200).json({
            message: 'Question deleted',
            status: 'successful',
            data: []
        });
    } catch (error) {
        // Log error and return internal server error response
        console.log("ERROR DELETE QUESTION ", error);
        return res.status(500).json({
            message: 'Internal server error',
            status: 'failure',
            data: []
        });
    }
};


/**
 * get details of question
 * takes the question id from parameters
 * check if it is valid or not
 * populate the options array and send it to the user
 */

// Define the getQuestion function
module.exports.getQuestion = async function (req, res) {
    try {
        const questionId = req.params.id;

        // Check if questionId is missing
        if (!questionId) {
            return res.status(404).json({
                message: 'Empty Question id',
                status: 'failure',
                data: []
            });
        }

        // Find the question by its ID
        const question = await Question.findById(questionId);

        // Check if question exists
        if (!question) {
            return res.status(404).json({
                message: 'Invalid Question id',
                status: 'failure',
                data: []
            });
        }

        // Populate options for the question
        await question.populate({ path: 'options', select: '-question_id' });

        // Return the question with populated options
        return res.status(200).json({
            message: 'Question fetched',
            status: 'successful',
            data: [question]
        });
    } catch (error) {
        console.log("ERROR GET QUESTION ", error);
        return res.status(500).json({
            message: 'Internal server error',
            status: 'failure',
            data: []
        });
    }
};
