import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const testEnvironment = () => {
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'PINECONE_INDEX_NAME'
  ];

  console.log('Testing environment configuration...');

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error('❌ Missing environment variables:', missingEnvVars);
    process.exit(1);
  }

  console.log('✅ All required environment variables are present');

  // Log the environment (but not the actual keys)
  console.log('Environment configuration:');
  console.log('- PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT);
  console.log('- PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME);
  console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '(set)' : '(not set)');
  console.log('- PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '(set)' : '(not set)');
};

testEnvironment();