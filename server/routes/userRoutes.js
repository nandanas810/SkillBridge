const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUsersForTesting,
    getStudentPortfolio,
    updateStudentPortfolio,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/test-users", getUsersForTesting);


router.get("/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});


// Student Portfolio
router.get(
    "/student-portfolio",
    authMiddleware,
    getStudentPortfolio
);

router.put(
    "/student-portfolio",
    authMiddleware,
    updateStudentPortfolio
);


module.exports = router;