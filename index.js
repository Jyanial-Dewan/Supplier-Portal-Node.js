const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express()
app.use(cors());
app.use(bodyParser.json());

app.use(require('./routes/categoryRoute'))

app.use(require('./routes/productsRoute'))

app.use(require('./routes/attributesRoute'))
  

app.listen(3000, ()=> console.log('server started on port 3000'))  