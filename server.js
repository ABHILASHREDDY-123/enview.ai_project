const express = require("express")
const THRESHOLDS = require("./thresholds")
const appRouter = require("./appRouter")
const app = express();
const PORT = 8080;
app.use(express.json());

app.use("/",appRouter)


app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`)
})