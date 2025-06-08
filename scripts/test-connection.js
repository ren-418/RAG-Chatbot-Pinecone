import https from 'https';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

const testConnection = async () => {
  console.log('Testing network connectivity...\n');

  // Test DNS resolution
  console.log('Testing DNS resolution:');
  try {
    const ips = await resolve4('api.pinecone.io');
    console.log('✅ DNS resolution successful');
    console.log('Resolved IPs:', ips);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
  }

  // Test HTTPS connectivity
  console.log('\nTesting HTTPS connectivity:');
  const sites = [
    'api.pinecone.io',
    'controller.pinecone.io',
    'api.openai.com'
  ];

  for (const site of sites) {
    try {
      await new Promise((resolve, reject) => {
        const req = https.get(`https://${site}`, {
          timeout: 5000,
          rejectUnauthorized: false
        }, (res) => {
          console.log(`✅ Connected to ${site} (Status: ${res.statusCode})`);
          res.destroy();
          resolve();
        });

        req.on('error', (error) => {
          console.log(`❌ Failed to connect to ${site}:`, error.message);
          reject(error);
        });

        req.on('timeout', () => {
          console.log(`❌ Connection to ${site} timed out`);
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
    } catch (error) {
      // Error already logged above
    }
  }

  console.log('\nNetwork Diagnostics:');
  console.log('-------------------');
  console.log('Node.js Version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);

  if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
    console.log('\nProxy Settings:');
    console.log('HTTPS_PROXY:', process.env.HTTPS_PROXY || 'not set');
    console.log('HTTP_PROXY:', process.env.HTTP_PROXY || 'not set');
  }
};

testConnection();