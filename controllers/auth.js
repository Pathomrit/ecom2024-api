const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate body
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check Email in DB
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    // console.log(email, password);
    // console.log(user);
    if (user) {
      return res.status(400).json({ message: "Email already exits" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    // console.log(hashPassword);

    // Register
    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });
    res.send("Register Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);

    // Check email
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user || !user.enabled) {
      return res.status(400).json({ message: "User not found or not enabled" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password Invalid" });
    }

    // Payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    // console.log(payload);

    //Generate Token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Server Error" });
      } else {
        res.json({ payload, token });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
