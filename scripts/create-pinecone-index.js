import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const createIndex = async (indexName, dimension = 1536) => {
  try {
    // Verify required environment variables
    if (!process.env.PINECONE_API_KEY) {
      console.error('❌ Missing PINECONE_API_KEY in environment variables!');
      process.exit(1);
    }

    if (!indexName) {
      console.error('❌ Please provide an index name as an argument!');
      console.error('Usage: npm run create-index [index-name] [dimension]');
      console.error('Example: npm run create-index my-new-index 1536');
      process.exit(1);
    }

    console.log('Initializing Pinecone client...');

    // Initialize the client
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    console.log(`\nChecking if index '${indexName}' exists...`);

    // List all indexes
    const indexList = await pc.listIndexes();
    const indexes = indexList.indexes || [];

    // Check if index already exists
    const existingIndex = indexes.find(idx => idx.name === indexName);
    if (existingIndex) {
      console.log('✅ Index already exists!');
      console.log('\nIndex Details:');
      console.log('-------------');
      console.log('Name:', existingIndex.name);
      console.log('Dimension:', existingIndex.dimension);
      console.log('Metric:', existingIndex.metric);
      console.log('Host:', existingIndex.host);
      console.log('Status:', existingIndex.status?.state || 'Unknown');
      return;
    }

    console.log(`\nCreating index '${indexName}'...`);
    console.log(`Dimension: ${dimension}`);

    // Create index with configuration for free tier
    await pc.createIndex({
      name: indexName,
      dimension: dimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'  // Free tier region
        }
      }
    });

    console.log('✅ Index creation initiated!');
    console.log('Note: It may take 1-2 minutes for the index to be ready');

    // Wait for 30 seconds
    console.log('\nWaiting 30 seconds for index initialization...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify the index was created
    console.log('Verifying index creation...');
    const updatedIndexList = await pc.listIndexes();
    const updatedIndexes = updatedIndexList.indexes || [];

    const newIndex = updatedIndexes.find(idx => idx.name === indexName);
    if (newIndex) {
      console.log(`✅ Index '${indexName}' is created successfully!`);
      console.log('\nIndex Details:');
      console.log('-------------');
      console.log('Name:', newIndex.name);
      console.log('Dimension:', newIndex.dimension);
      console.log('Metric:', newIndex.metric);
      console.log('Host:', newIndex.host);
      console.log('Status:', newIndex.status?.state || 'Initializing');
      console.log('\nYou can now proceed with using the chatbot.');
    } else {
      console.log(`⚠️ Index creation is still in progress...`);
      console.log('Please wait a few more minutes before using the chatbot.');
    }

  } catch (error) {
    console.error('\nError creating index:', error.message);

    if (error.message.includes('already exists')) {
      console.log('✅ Index already exists, you can proceed with using the chatbot');
    } else {
      console.error('\nTroubleshooting steps:');
      console.error('1. Verify your PINECONE_API_KEY is correct');
      console.error('2. Make sure you have an active Pinecone account');
      console.error('3. Check if you have reached your index limit');

      // Parse and display the error details if available
      try {
        const errorDetails = JSON.parse(error.message);
        if (errorDetails.error) {
          console.error('\nError Details:');
          console.error('Code:', errorDetails.error.code);
          console.error('Message:', errorDetails.error.message);
        }
      } catch (e) {
        // If error message isn't JSON, display as is
        console.error('\nFull error:', error);
      }
      process.exit(1);
    }
  }
};

// Get command line arguments
const indexName = process.argv[2];
const dimension = parseInt(process.argv[3]) || 1536;

createIndex(indexName, dimension);