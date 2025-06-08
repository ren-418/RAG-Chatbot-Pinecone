import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const testPinecone = async () => {
  try {
    // Verify required environment variables
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
      console.error('❌ Missing required environment variables!');
      console.error('Please make sure you have set:');
      console.error('- PINECONE_API_KEY');
      console.error('- PINECONE_ENVIRONMENT');
      process.exit(1);
    }

    console.log('Testing Pinecone connection...');
    console.log('Environment:', process.env.PINECONE_ENVIRONMENT);
    console.log('Index name:', process.env.PINECONE_INDEX_NAME);

    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    });

    // Test basic connection
    console.log('\nTesting basic connection...');
    const indexes = await pinecone.listIndexes();
    console.log('Available indexes:', indexes);

    // Check if our index exists
    const indexName = process.env.PINECONE_INDEX_NAME;
    const indexExists = indexes.some(index => index.name === indexName);

    if (!indexExists) {
      console.error(`❌ Index '${indexName}' not found in your Pinecone project`);
      console.log('Available indexes:', indexes.map(index => index.name));
      console.log('\nPlease run: npm run create-index');
      process.exit(1);
    }

    // Get index details
    console.log(`\nTesting access to index '${indexName}'...`);
    const index = pinecone.index(indexName);
    const description = await index.describeIndex();

    console.log('\n✅ Pinecone connection successful!');
    console.log('\nIndex Details:');
    console.log('-------------');
    console.log('Status:', description.status);
    console.log('Dimension:', description.dimension);
    console.log('Metric:', description.metric);
    if (description.host) {
      console.log('Host:', description.host);
    }

  } catch (error) {
    console.error('\nError testing Pinecone connection:', error.message);

    console.log('\nTroubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your PINECONE_API_KEY is correct');
    console.log('3. Make sure your PINECONE_ENVIRONMENT is correct (e.g., "gcp-starter" or "us-west1-gcp-free")');
    console.log('4. Check if you need to configure a proxy or VPN');
    console.log('\nIf the index does not exist, run: npm run create-index');

    process.exit(1);
  }
};

testPinecone();