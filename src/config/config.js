import dotenv from 'dotenv';
dotenv.config();
export default {
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
    }
}