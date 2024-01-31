const fs = require('fs');
const axios = require('axios');
const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();

// OpenAI API Key
const apiKey =  process.env.OPENAI_API_KEY; //'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'
const openai = new OpenAI({ apiKey: apiKey });
const app = express();

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };


// Function to encode the image
function encodeImage(imagePath) {
  const image = fs.readFileSync(imagePath);
  const base64Image = Buffer.from(image).toString('base64');

  return base64Image;
}

// Path to your image
const imagePath = process.env.IMAGE_PATH;// '\\\\192.168.68.138\\config\\www\\camimages\\photocam.jpg';

// Getting the base64 string
const base64Image = encodeImage(imagePath);


const payload = {
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: process.env.PROMPT
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 300
  };
  


const analyzeImage = async (imagePath) => {

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: process.env.PROMPT },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imagePath,
                                "detail": "low"
                            },
                        },
                    ],
                },
            ],
        });
        console.log(response.choices[0]);
        return response.choices[0];
    } catch (error) {
        console.error("Erro ao analisar a imagem:", error);
    }
}

app.get('/b', (req, res) => {
  axios.post('https://api.openai.com/v1/chat/completions', payload, { headers: headers })
  .then(response => {
    console.log(response.data.choices[0].message.content);
    res.send(response.data.choices[0].message.content);
  })
  .catch(error => {
    console.error(error);
  });
});


app.get('/a', (req, res) => {
    // res.send('Hello World com ESM!');
    res.send(analyzeImage(process.env.IMAGE_URL));
});

app.listen(process.env.PORTA, () => {
    console.log(`Aplicação rodando na porta ${process.env.PORTA}`);
});
