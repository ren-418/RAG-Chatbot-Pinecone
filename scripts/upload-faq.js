import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env' });

const uploadFAQ = async () => {
  try {
    console.log('Starting FAQ upload process...\n');

    // Verify environment variables
    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      console.error('❌ Missing required environment variables!');
      console.error('Please make sure you have set:');
      console.error('- PINECONE_API_KEY');
      console.error('- OPENAI_API_KEY');
      console.error('- PINECONE_INDEX_NAME');
      process.exit(1);
    }

    // Initialize OpenAI embeddings
    console.log('Initializing OpenAI embeddings...');
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    });

    // Initialize Pinecone client
    console.log('Connecting to Pinecone...');
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    // Get the index
    const indexName = process.env.PINECONE_INDEX_NAME;
    const index = pc.index(indexName);

    // Read FAQ data
    console.log('Reading FAQ data...');
    const faqPath = path.join(process.cwd(), 'data', 'faq.json');
    const rawData = JSON.parse(await fs.readFile(faqPath, 'utf8'));

    // Extract the FAQ array from the data structure
    const faqData = rawData.faqs;

    if (!Array.isArray(faqData)) {
      throw new Error('FAQ data is not in the correct format. Expected an array of questions and answers.');
    }

    console.log(`Found ${faqData.length} FAQ items`);

    // Process FAQ items in batches
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < faqData.length; i += batchSize) {
      batches.push(faqData.slice(i, i + batchSize));
    }

    console.log(`Processing ${batches.length} batches of up to ${batchSize} items each`);

    let totalProcessed = 0;
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`\nProcessing batch ${batchIndex + 1}/${batches.length}...`);

      // Generate embeddings for questions and answers
      const embedPromises = batch.map(async (item, idx) => {
        const questionEmbedding = await embeddings.embedQuery(item.question);
        const answerEmbedding = await embeddings.embedQuery(item.answer);

        return [
          {
            id: `q${totalProcessed + idx}`,
            values: questionEmbedding,
            metadata: {
              type: 'question',
              text: item.question,
              answer: item.answer
            }
          },
          {
            id: `a${totalProcessed + idx}`,
            values: answerEmbedding,
            metadata: {
              type: 'answer',
              text: item.answer,
              question: item.question
            }
          }
        ];
      });

      const batchEmbeddings = await Promise.all(embedPromises);
      const vectors = batchEmbeddings.flat();

      // Upsert vectors to Pinecone
      console.log(`Uploading ${vectors.length} vectors to Pinecone...`);
      await index.upsert(vectors);

      totalProcessed += batch.length;
      console.log(`Progress: ${totalProcessed}/${faqData.length} items processed`);
    }

    console.log('\n✅ FAQ upload completed successfully!');
    console.log(`Total items processed: ${totalProcessed}`);
    console.log(`Total vectors created: ${totalProcessed * 2}`);

  } catch (error) {
    console.error('\n❌ Error uploading FAQ:', error.message);

    if (error.message.includes('ENOENT')) {
      console.error('\nFAQ data file not found!');
      console.error('Please make sure:');
      console.error('1. The data directory exists in the project root');
      console.error('2. There is a faq.json file in the data directory');
      console.error('3. The faq.json file contains valid JSON data');
    } else {
      console.error('\nTroubleshooting steps:');
      console.error('1. Check if your API keys are correct');
      console.error('2. Verify your internet connection');
      console.error('3. Make sure your Pinecone index exists and is ready');
      console.error('4. Check if the FAQ data format is correct');
      console.error('\nExpected FAQ format in data/faq.json:');
      console.error('{');
      console.error('  "faqs": [');
      console.error('    {');
      console.error('      "question": "Example question?",');
      console.error('      "answer": "Example answer"');
      console.error('    },');
      console.error('    ...');
      console.error('  ]');
      console.error('}');
    }

    // Log detailed error information
    if (error.stack) {
      console.error('\nDetailed error information:');
      console.error(error.stack);
    }

    process.exit(1);
  }
};

uploadFAQ();