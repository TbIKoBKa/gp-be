declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'staging';
      HOST: string;
      PORT: number;
      FE_URL: string;
      MYSQL_HOST: string;
      MYSQL_PORT: number;
      MYSQL_NAME: string;
      MYSQL_USER: string;
      MYSQL_PASSWORD: string;
      MOJANG_API: string;
      MCHEAD_API: string;
      LIQPAY_PUBLIC_KEY: string;
      LIQPAY_PRIVATE_KEY: string;
      LIQPAY_SERVER_URL: string;
      INTERKASSA_CHECKOUT_ID: string;
      INTERKASSA_SIGN_KEY: string;
      PP_TOKEN: string;
      PP_SHOP_ID: string;
    }
  }
}
export = NodeJS;
