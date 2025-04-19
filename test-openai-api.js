// Test script for OpenAI API connection
// Run with: node test-openai-api.js

import { OpenAI } from 'openai';

async function testOpenAIConnection() {
  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return false;
    }

    if (!apiKey.startsWith('sk-')) {
      console.error('❌ Invalid OpenAI API key format. Key should start with "sk-"');
      return false;
    }

    console.log('🔑 Found OpenAI API key');

    // Initialize OpenAI with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('🔍 Testing OpenAI API connection...');
    
    // Make a simple test request to models list (lightweight call)
    const response = await openai.models.list();
    
    if (response && response.data && response.data.length > 0) {
      console.log('✅ Successfully connected to OpenAI API');
      console.log(`📊 Available models: ${response.data.length}`);
      
      // Show first 3 models
      console.log('📋 Sample models:');
      response.data.slice(0, 3).forEach(model => {
        console.log(`   - ${model.id}`);
      });
      
      return true;
    } else {
      console.error('❌ Connection succeeded but no models returned');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing OpenAI connection:');
    console.error(error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
    }
    
    return false;
  }
}

async function testSimpleCompletion() {
  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return false;
    }

    // Initialize OpenAI with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('🔍 Testing a simple completion...');
    
    // Make a simple completion request
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, could you give me a quick market analysis tip?" }
      ],
      max_tokens: 50
    });
    
    if (completion && completion.choices && completion.choices.length > 0) {
      console.log('✅ Successfully received completion');
      console.log('📝 Response:');
      console.log(completion.choices[0].message.content);
      return true;
    } else {
      console.error('❌ Completion succeeded but no valid response returned');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing OpenAI completion:');
    console.error(error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting OpenAI API tests...');
  
  const connectionTest = await testOpenAIConnection();
  console.log('\n');
  
  if (connectionTest) {
    await testSimpleCompletion();
  }
  
  console.log('\n🏁 OpenAI API tests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Fatal error running tests:');
  console.error(error);
});