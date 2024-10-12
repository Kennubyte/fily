import express from 'express';
import client from './redisClient'
import cors from "cors";



const app = express();
const port = 8080;

app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/api/getResourceByCode/:code', async (req, res) => {
    const code = req.params.code
    if (!code.match(/^\d+$/)) {
        res.status(400).send("Code must be a number");
        return;
    }

    if (code.length !== 6) {
      res.status(400).send("Code must be 6 digits");
      return;
    }

    const redis = await client.get(code)
    if(!redis){
        res.status(404).send('Resource not found')
        return
    }

    res.send(redis);
});

app.post('/api/createDownloadableResource', async (req, res) => {
    let trueCode
    let attempts = 0
    while(!trueCode){
        if(attempts > 10){
            break
        }

        attempts++
        const code = Math.random().toString().slice(2, 8);
        const codeCheck = await client.get(code)
        if(codeCheck){
            return
        }
        trueCode = code
    }

    if(!trueCode){
        res.status(500).send('Could not generate code')
        return
    }

    client.set(trueCode, 'true')
    client.expire(trueCode, 60) // 1 minute

    res.send(trueCode);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});