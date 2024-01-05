import * as dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';
import path from 'path';
import fs from 'fs';
import process from 'process';

dotenv.config({ path: path.resolve('.env') });

const func_env_path = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV.toLowerCase()}` : '.env';

if (fs.existsSync(func_env_path)) {
  dotenv.config({ path: path.resolve(func_env_path) });
}

const ns = process.env.NAMESPACE;
if (ns) {
  const func_ns_env_path = `.${ns}-env`;
  if (fs.existsSync(func_ns_env_path)) {
    dotenv.config({ path: path.resolve(func_ns_env_path) });
  }
}

const func_test_env_path = '.test-env';
if (fs.existsSync(func_test_env_path)) {
  dotenv.config({ path: path.resolve(func_test_env_path) });
}

const env = cleanEnv(process.env, {
  PROCESS_ENV: str({ default: 'TS' }),
  PORT: port({ default: 4000 }),
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging', 'local', 'uat'], default: 'development' }),
  RUNTIME: str({ choices: ['ts'], default: 'ts' }),

  // General
  SENTRY_DSN: str({ default: '' }),
  AZURE_KEYVAULT_URI: str({ default: '' }),

  //Remove me
  FUNC_TEST_ENV_VAR: str({ default: '' })
});

export default env;
