import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const testOpenAI = async () => {
  try {
    console.log('Testing OpenAI connection...');

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small"
    });

    // Test with a simple text
    const text = "Hello, this is a test.";
    console.log('Generating embedding for:', text);

    const result = await embeddings.embedQuery(text);
    console.log('Successfully connected to OpenAI!');
    console.log('Embedding length:', result.length);
  } catch (error) {
    console.error('Error testing OpenAI:', error);
    process.exit(1);
  }
};

testOpenAI();