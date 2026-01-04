import { Router } from "express";

const router = Router();

router.route("/register").post((req, res) => {
    // Registration logic here
    res.status(200).json({ message: "ok" });
});

export default router;