import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const verifyPinecone = async () => {
  try {
    console.log('Testing Pinecone connection...');

    // Verify environment variables
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not set in .env file');
    }

    // Initialize Pinecone client
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    // List indexes to verify connection
    console.log('Fetching indexes...');
    const indexList = await pc.listIndexes();
    const indexes = indexList.indexes || [];

    console.log('\nPinecone Connection Details:');
    console.log('---------------------------');
    console.log('Connection Status: ✅ Successfully connected to Pinecone!');
    console.log('Available Indexes:', indexes.length);

    // Display index details
    if (indexes.length > 0) {
      console.log('\nIndex Details:');
      indexes.forEach(index => {
        console.log(`\n${index.name}:`);
        console.log('  Dimension:', index.dimension);
        console.log('  Metric:', index.metric);
        console.log('  Status:', index.status?.state || 'Unknown');
        console.log('  Host:', index.host);
      });
    } else {
      console.log('\nNo indexes found. You may want to create one using:');
      console.log('npm run create-index <index-name>');
    }

  } catch (error) {
    console.error('\n❌ Error connecting to Pinecone:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check if your PINECONE_API_KEY is correct');
    console.error('2. Verify your internet connection');
    console.error('3. Make sure your Pinecone account is active');

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
      if (error.stack) {
        console.error('\nFull error stack:', error.stack);
      }
    }
    process.exit(1);
  }
};

verifyPinecone();