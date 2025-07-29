import axios from 'axios';

export const generateSuggestion = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ message: 'Prompt is required.' });

  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
        model: 'llama3.2:latest',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    return res.status(200).json({ result: response.data.message.content });
  } catch (error) {
    console.error('Ollama AI Error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to generate suggestion.' });
  }
};

  
