const fsPromises = require("fs").promises;
const path = require("path");
const jwt = require("jsonwebtoken");

const updateData = async (writeData) => {
  try {
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "user.json"),
      writeData
    );
  } catch (error) {
    console.log("User Auth token update", error);
  }
};

const usersDB = {
  users: require("../model/user.json"),
  setUsers: function (data) {
    updateData(JSON.stringify(data));
  },
};

const handleRefreshToken = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });
  const refreshToken = cookies.jwt;

  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );

  if (!foundUser) return res.status(403).json({ message: 'Forbidden' }); // Forbidden
  // Evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.status(403).json({ message: 'Forbidden1' });
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
