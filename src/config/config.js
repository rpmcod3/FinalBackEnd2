import dotenv from 'dotenv';

dotenv.config();


export const config = {
    mongo:{
        url:process.env.MONGO_URL
    },
      jwt:{
        cookie_name:process.env.JWT_COOKIE_NAME,
        secret:process.env.JWT_SECRET
    },
    auth:{
        ADMIN:process.env.ADMIN,
        ADMIN_PASSWORD:process.env.ADMIN_PASSWORD
    },
    email: {
        HOST: process.env.MAIL_HOST,
        PORT: process.env.MAIL_PORT,
        USER: process.env.MAIL_USER,
        PASSWORD: process.env.MAIL_PASSWORD,
    },
    server: {
        port: process.env.SERVER_PORT || 8080, 
    },
};

export default config;

/* port: process.env.SERVER_PORT || 587,  */