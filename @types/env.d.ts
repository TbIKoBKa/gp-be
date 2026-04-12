declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'staging';
      HOST: string;
      PORT: number;
      FE_URL: string;
      JWT_SECRET: string;
      MC_DB_HOST: string;
      MC_DB_PORT: number;
      MC_DB_NAME: string;
      MC_DB_USER: string;
      MC_DB_PASSWORD: string;
      GP_DB_HOST: string;
      GP_DB_PORT: number;
      GP_DB_NAME: string;
      GP_DB_USER: string;
      GP_DB_PASSWORD: string;
      HOTMC_SECRET_KEY: string;
      MINESERV_SECRET_KEY: string;
      MCSERVERA_SECRET_KEY: string;
      FREEKASSA_MERCHANT_ID: string;
      FREEKASSA_SECRET1: string;
      FREEKASSA_SECRET2: string;
      BRIDGE_URL: string;
      BRIDGE_SECRET: string;
    }
  }
}
export = NodeJS;
