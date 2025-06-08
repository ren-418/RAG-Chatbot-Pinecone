import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const checkPineconeProject = async () => {
  try {
    if (!process.env.PINECONE_API_KEY) {
      console.error('❌ PINECONE_API_KEY is not set in .env file');
      process.exit(1);
    }

    console.log('Checking Pinecone configuration...\n');

    // Initialize Pinecone client
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    // List all indexes
    console.log('Fetching indexes...');
    const indexList = await pc.listIndexes();

    console.log('\nYour Pinecone Configuration:');
    console.log('---------------------------');
    console.log('API Key:', '********' + process.env.PINECONE_API_KEY.slice(-4));

    // Debug the response
    console.log('\nIndexes found:', typeof indexList === 'object' ? JSON.stringify(indexList, null, 2) : indexList);

    const indexes = Array.isArray(indexList) ? indexList : Object.values(indexList);
    console.log('\nAvailable Indexes:', indexes.length ? indexes.join(', ') : 'No indexes found');

    if (process.env.PINECONE_INDEX_NAME) {
      const indexExists = indexes.includes(process.env.PINECONE_INDEX_NAME);
      if (indexExists) {
        console.log('\n✅ Found your index:', process.env.PINECONE_INDEX_NAME);

        // Get more details about the index
        const index = pc.index(process.env.PINECONE_INDEX_NAME);
        try {
          const description = await index.describeIndex();

          console.log('\nIndex Details:');
          console.log('-------------');
          console.log('Name:', process.env.PINECONE_INDEX_NAME);
          if (description) {
            console.log('Dimension:', description.dimension);
            console.log('Metric:', description.metric);
            console.log('Pod Type:', description.spec?.pod?.podType || 'serverless');
          }
        } catch (describeError) {
          console.log('\n⚠️ Could not fetch index details:', describeError.message);
        }
      } else {
        console.log('\n⚠️ Your configured index was not found:', process.env.PINECONE_INDEX_NAME);
        console.log('\nWould you like to create it? Run:');
        console.log('npm run create-index');
      }
    }

    console.log('\nEnvironment Setup:');
    console.log('----------------');
    console.log('Your .env file should contain:');
    console.log('OPENAI_API_KEY=your_openai_key');
    console.log('PINECONE_API_KEY=your_current_api_key');
    console.log('PINECONE_INDEX_NAME=your_index_name (e.g., arg-faq-index)');

  } catch (error) {
    console.error('\nError checking Pinecone configuration:', error.message);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n❌ Your PINECONE_API_KEY appears to be invalid.');
      console.log('Please check your API key in the Pinecone console:');
      console.log('https://app.pinecone.io/organizations/-/apikeys');
    } else {
      console.log('\nTroubleshooting steps:');
      console.log('1. Verify your PINECONE_API_KEY is correct');
      console.log('2. Make sure you have an active Pinecone account');
      console.log('3. Try logging in to the Pinecone console: https://app.pinecone.io');
      console.log('4. Check if you need to upgrade your Pinecone plan');

      // Log the full error for debugging
      console.log('\nFull error details:', error);
    }
    process.exit(1);
  }
};

checkPineconeProject();