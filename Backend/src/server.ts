import express from "express";
import authRouter from "./routes/auth.route";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api/auth', authRouter);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});