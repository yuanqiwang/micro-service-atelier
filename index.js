
const app = require('./app.js')

let port = 5000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

