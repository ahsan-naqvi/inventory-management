import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import UsersRoutes from './routes/Users.js';
import ProductRoutes from './routes/Product.js';

const app = express();

//#region Initializations

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

//#endregion

//#region Controllers Routes

app.use('/users',UsersRoutes);
app.use('/product',ProductRoutes);

//#endregion

//#region DB Connection

const CONNECTION_URL = 'mongodb+srv://ahsan0210:admin1234@cluster0.sfqws.mongodb.net/fastCoDB?retryWrites=true&w=majority';
const PORT = process.env.PORT|| 5000;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

// mongoose.set('useFindAndModify', false);

//#endregion