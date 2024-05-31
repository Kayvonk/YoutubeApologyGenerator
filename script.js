const { OpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const port = 3001;

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());

const model = new OpenAI({ 
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  model: 'gpt-3.5-turbo'
});

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  instructions: "Instructions on how to make a video that will make the youtuber giving the apology look truthful and sincere.",
  apology: "An apology written for the youtuber."
});

const formatInstructions = parser.getFormatInstructions();

// Instantiation of a new object called "prompt" using the "PromptTemplate" class
const prompt = new PromptTemplate({
  template: "The user will provide an disgraceful act that they have committed. You are knowledgeable about how to provide an apology that will make them look good to the public. Make sure to address why the act provided by the user was wrong. The length of the apology should be 20 sentences long or longer. \n{format_instructions}\n{question}",
  inputVariables: ["question"],
  partialVariables: { format_instructions: formatInstructions }
});


const promptFunc = async (input) => {
  try {
    // Format the prompt with the user input
    const promptInput = await prompt.format({
      question: input
    });

    // Call the model with the formatted prompt
    const res = await model.invoke(promptInput);
    
    // For a non-coding question, the model returns an error message, causing parse() to throw an exception.
    // In this case, simply return the error message instead of the parsed results.
    try { 
      const parsedResult = await parser.parse(res);
      return parsedResult;
    } catch (e) { 
      return res;
    }
  }
  catch (err) {
    console.error(err);
    throw(err);
  }
};

// Endpoint to handle request
app.post('/ask', async (req, res) => {
  try {
    const userQuestion = req.body.question;

    if (!userQuestion) {
      return res.status(400).json({ error: 'Please provide a question in the request body.' });
    }

    const result = await promptFunc(userQuestion);
    console.log(result);
    res.json({ result });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});