
const Question = require('../../../models/question');
const Option = require('../../../models/option');

/**
 * create a option
 * takes the question id from parameters and text of option from body of request
 * check if quetionsId is valid or not if question id is valid then we create an option
 * assign link to vote dynamicaly and push option id to the question's options array
 */


// Define the create poll function
module.exports.create = async function (req, res) {
    try {
        const questionId = req.params.id;
        const { text } = req.body;

        // Check if question ID or option text is missing
        if (!questionId || !text) {
            return res.status(400).json({
                message: 'Missing Question ID or option text',
                status: 'failure',
                data: []
            });
        }

        // Find the question by its ID
        const question = await Question.findById(questionId);

        // Check if the question exists
        if (!question) {
            return res.status(404).json({
                message: 'Invalid Question ID',
                status: 'failure',
                data: []
            });
        }

        // Create the option 
        const option = await Option.create({ 'text': text, 'question_id': question._id });

        // Check if the option was created successfully
        if (!option) {
            throw new Error('Unable to create option');
        }

        // Update the link_to_vote property with a relative URL
        option.link_to_vote = `/api/v1/options/${option.id}/add_vote`;
        await option.save();

        // Add the option to the question's options array
        question.options.push(option._id);
        await question.save();

        // Return success response
        return res.status(201).json({
            message: 'Option created',
            status: 'successful',
            data: [option]
        });

    } catch (error) {
        console.log('CREATE OPTION ERROR: ', error);
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 'failure',
            data: []
        });
    }
};



/**
 * delete the option 
 * takes option id from parameters
 * check if option id is valid or not if it is valid
 * first remove option's id from question's options array
 * then delete the option from db
 */

// Define the delete function
module.exports.delete = async function (req, res) {
    try {
        const optionId = req.params.id;

        // Check if option ID is missing
        if (!optionId) {
            return res.status(400).json({
                message: 'Missing option ID',
                status: 'failure',
                data: []
            });
        }

        // Find the option by its ID
        const option = await Option.findById(optionId);

        // Check if the option exists
        if (!option) {
            return res.status(404).json({
                message: 'Invalid option ID',
                status: 'failure',
                data: []
            });
        }

        // Remove the option ID from the associated question's options array
        await Question.findByIdAndUpdate(option.question_id, { $pull: { 'options': option.id } });

        // Delete the option
        await Option.findByIdAndDelete(optionId);

        // Return success response
        return res.status(200).json({
            message: 'Option deleted',
            status: 'successful',
            data: []
        });

    } catch (error) {
        console.log('DELETE OPTION ERROR: ', error);

        return res.status(500).json({
            message: 'Internal Server Error',
            status: 'failure',
            data: []
        });
    }
};



/**
 * add vote to the option
 * takes option id from parameters of request
 * check if option id is valid or not if valid increate votes by 1
 * and return option object
 */


// Define the addVote function
module.exports.addVote = async function (req, res) {
    try {
        const optionId = req.params.id;

        // Check if option ID is missing
        if (!optionId) {
            return res.status(400).json({
                message: 'Missing option ID',
                status: 'failure',
                data: []
            });
        }

        // Find the option by its ID
        const option = await Option.findById(optionId);

        // Check if the option exists
        if (!option) {
            return res.status(404).json({
                message: 'Invalid option ID',
                status: 'failure',
                data: []
            });
        }

        // Increment the votes count
        option.votes++;
        await option.save();

        // Return success response
        return res.status(200).json({
            message: 'Vote incremented',
            status: 'successful',
            data: [option]
        });

    } catch (error) {
        console.log('ADD VOTE TO OPTION ERROR: ', error);

        return res.status(500).json({
            message: 'Internal Server Error',
            status: 'failure',
            data: []
        });
    }
};
