const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fsPromises = require("fs").promises;

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

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  const foundUser = usersDB.users.find((person) => person.username === user);
  if (!foundUser) return res.status(401).json({ error: "User not found!" }); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    // create JWTs
    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    const otherUsers = usersDB.users.filter(
      (person) => person.username !== foundUser.username
    );
    const currentUser = { ...foundUser, refreshToken };
    usersDB.setUsers([...otherUsers, currentUser]);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ success: `User ${user} is logged in!` , accessToken });
  } else {
    res.status(401).json({ error: "Password Incorrect" });
  }
};

module.exports = { handleLogin };
