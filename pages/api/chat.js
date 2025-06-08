import { Pinecone } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "history",
});

export default async function handler(req, res) {
  // Validate environment variables
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_INDEX_NAME'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error('Missing environment variables:', missingEnvVars);
    return res.status(500).json({
      error: "Configuration Error",
      details: `Missing required environment variables: ${missingEnvVars.join(', ')}`
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log('Processing query:', query);

    // Initialize OpenAI
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-3.5-turbo"
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(`
        The following is a friendly conversation between a human and an AI.
        The AI is talkative and provides lots of specific details from its context.
        If the AI does not know the answer to a question, it truthfully says it does not know.
        Use the "history" to understand what we've already talked about in the conversation.

        Use the CONTEXT below to answer the QUESTION asked by the user.
        `),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const llmChain = new ConversationChain({
      memory,
      prompt: chatPrompt,
      llm: model,
      verbose: true,
    });

    console.log('Initializing Pinecone client...');
    // Initialize Pinecone client with minimal configuration
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    // Test connection before proceeding
    try {
      const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
      const stats = await index.describeIndexStats();
      console.log('Pinecone index stats:', stats);
    } catch (error) {
      console.error('Failed to connect to Pinecone:', error);
      return res.status(500).json({
        error: "Failed to connect to Pinecone",
        details: error.message,
        type: error.name
      });
    }

    console.log('Getting Pinecone index...');
    const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);

    console.log('Creating vector store...');
    // Create vector store
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        openAIApiKey: process.env.OPENAI_API_KEY
      }),
      {
        pineconeIndex
      }
    );

    console.log('Creating vector chain...');
    const vectorChain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 5,
      returnSourceDocuments: true,
    });

    console.log('Getting response from vector chain...');
    const pineconeResponse = await vectorChain.call({ query });

    console.log('Creating final prompt...');
    const prompt = `
          CONTEXT: ${JSON.stringify(pineconeResponse)}

          QUESTION: ${query}
          `;

    console.log('Getting final response from LLM...');
    const response = await llmChain.call({ input: prompt });

    console.log('Successfully processed query');
    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error occurred';
    return res.status(500).json({
      error: "Failed to process query",
      details: errorMessage,
      type: error.name || 'Error'
    });
  }
}
