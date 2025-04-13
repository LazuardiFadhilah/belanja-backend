import dotenv from 'dotenv';
import mongoose from 'mongoose';
const env = dotenv.config();

const connection =  () => {
    mongoose.connect(process.env.MONGODB_URI,
        {
            dbName: process.env.MONGODB_NAME,
        }
    );
    const conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));
    conn.once('open', () => {
        console.log(`Database connected, DB name:${process.env.MONGODB_NAME}`,);
        }
    );
}

export default connection;