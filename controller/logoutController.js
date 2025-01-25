const fsPromises = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "..", "model", "users.json");

const updateData = async (data) => {
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

const usersDB = {
  users: [], // Initialize as empty array
  initialize: async () => {
    try {
      const data = await fsPromises.readFile(filePath, "utf-8");
      usersDB.users = JSON.parse(data);
    } catch (error) {
      console.error("Error reading user data:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  },
  setUsers: async (data) => {
    usersDB.users = data;
    await updateData(data); // Update the data in the file
  },
};

const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUserIndex = usersDB.users.findIndex(
      (person) => person.refreshToken === refreshToken
    );
    if (foundUserIndex === -1) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }

    // Delete refreshToken in db
    const updatedUsers = [...usersDB.users];
    updatedUsers[foundUserIndex].refreshToken = ""; // Clear refreshToken
    await usersDB.setUsers(updatedUsers);

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.sendStatus(204);
  } catch (error) {
    console.error("Error during logout:", error);
    res.sendStatus(500); // Internal Server Error
  }
};

module.exports = { handleLogout, usersDB };
