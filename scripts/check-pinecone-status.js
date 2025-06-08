import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const checkPineconeStatus = async () => {
  try {
    console.log('Checking Pinecone index status...\n');

    // Verify environment variables
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      console.error('❌ Missing required environment variables!');
      console.error('Please make sure you have set:');
      console.error('- PINECONE_API_KEY');
      console.error('- PINECONE_INDEX_NAME');
      process.exit(1);
    }

    // Initialize Pinecone client
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    // Get the index
    const indexName = process.env.PINECONE_INDEX_NAME;
    const index = pc.index(indexName);

    // Get index description
    console.log('Fetching index details...');
    const indexStats = await index.describeIndexStats();

    console.log('\nIndex Statistics:');
    console.log('----------------');
    console.log('Total Vector Count:', indexStats.totalVectorCount);
    console.log('Dimension:', indexStats.dimension);

    // Get namespace statistics if available
    if (indexStats.namespaces) {
      console.log('\nNamespace Statistics:');
      console.log('-------------------');
      for (const [namespace, stats] of Object.entries(indexStats.namespaces)) {
        console.log(`Namespace: ${namespace || 'default'}`);
        console.log(`Vector Count: ${stats.vectorCount}`);
      }
    }

    // Query a few random vectors to verify content
    console.log('\nSampling index content...');

    // Query for questions
    const questionQuery = await index.query({
      vector: Array(indexStats.dimension).fill(0), // Zero vector for demonstration
      topK: 3,
      filter: {
        type: 'question'
      },
      includeMetadata: true
    });

    console.log('\nSample Questions in Index:');
    console.log('------------------------');
    questionQuery.matches.forEach((match, idx) => {
      console.log(`${idx + 1}. ${match.metadata.text}`);
    });

    // Query for answers
    const answerQuery = await index.query({
      vector: Array(indexStats.dimension).fill(0), // Zero vector for demonstration
      topK: 3,
      filter: {
        type: 'answer'
      },
      includeMetadata: true
    });

    console.log('\nSample Answers in Index:');
    console.log('----------------------');
    answerQuery.matches.forEach((match, idx) => {
      console.log(`${idx + 1}. ${match.metadata.text.substring(0, 100)}...`);
    });

    console.log('\n✅ Index check completed successfully!');

  } catch (error) {
    console.error('\n❌ Error checking Pinecone status:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check if your PINECONE_API_KEY is correct');
    console.error('2. Verify your internet connection');
    console.error('3. Make sure your Pinecone index exists and is ready');

    if (error.stack) {
      console.error('\nDetailed error information:');
      console.error(error.stack);
    }
    process.exit(1);
  }
};

checkPineconeStatus();