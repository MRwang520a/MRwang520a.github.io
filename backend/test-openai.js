const OpenAI = require('openai').default;

const openai = new OpenAI();

console.log('Testing OpenAI API...');
console.log('API Key present:', !!process.env.OPENAI_API_KEY);

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: 'Say hello' }],
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Status:', error.status);
  }
}

test();
