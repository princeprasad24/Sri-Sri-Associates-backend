// const mongoose = require('mongoose');

// export const connectDB = async () => {
//     try{
//         mongoose.connection.on('connected' , () =>{
//             console.log("MONGODB CONNECTED");
//         });
//         mongoose.connection.on('error' , (err) =>{
//             console.log("MONGODB CONNECTION FAILED" , err);
//         });
//         await mongoose.connect(`${process.env.VITE_MONGO_URL}/SRI_SRI_ASSOCIATES`);
//     }catch(err){
//         console.log("ERROR IN DB CONNECTION" , err);
//     }
// }

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
