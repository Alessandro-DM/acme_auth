const { syncAndSeed } =  require('./db');
const app = require('./app');

const init = async()=> {
  await syncAndSeed();
  const port = process.env.PORT || 8000;
  const key = process.env.JWT
  console.log(key)
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();
