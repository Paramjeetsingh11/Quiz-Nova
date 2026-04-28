const dotenv = require("dotenv");

dotenv.config();

const required = ["JWT_SECRET", "MYSQL_DATABASE"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "1234",
    database: process.env.MYSQL_DATABASE,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10)
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  },
  battle: {
    questionCount: Number(process.env.BATTLE_QUESTION_COUNT || 5)
  }
};

module.exports = env;
