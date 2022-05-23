const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}

const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.byToken = async(token)=> {
  const data = jwt.verify(token, process.env.JWT)
  try {
    const user = await User.findByPk(data);
    if(user){
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async(data)=> {
  const username = data.username;
  const password = data.password;
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  const user = await User.findOne({
    where: {
      username: username,
      password: hash
    }
  });
  if(user){
    bcrypt.compareSync(data.password, hash);
    return jwt.sign(user.id, process.env.JWT);
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const saltRounds = 10;
  const hash = bcrypt.hashSync('lucy_pw', saltRounds);
  const credentials = [
    { username: 'lucy', password: hash},
    { username: 'moe', password: hash},
    { username: 'larry', password: hash}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};
