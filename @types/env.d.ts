declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test" | "staging";
      PORT: number;
      HOST: string;
      FE_URL: string;
      MYSQL_HOST: string;
      MYSQL_PORT: number;
      MYSQL_NAME: string;
      MYSQL_USER: string;
      MYSQL_PASSWORD: string;
    }
  }
}
export = NodeJS;
