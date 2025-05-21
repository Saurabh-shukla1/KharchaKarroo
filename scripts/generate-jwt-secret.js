const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');
console.log('Generated JWT_SECRET:', secret);
console.log('\nAdd this to your .env file:');
console.log(`JWT_SECRET=${secret}`); 