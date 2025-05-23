const dotenv = require('dotenv');
const path = require('path');

// always get .test.env file for testing
dotenv.config({ path: path.resolve(process.cwd(), '.test.env') });
