# Perplexity API Setup Guide

## 🚀 Priority LLM System

The Brand Ranker now uses a **priority-based LLM system**:
1. **Perplexity Pro** (Priority 1) - Primary choice
2. **OpenAI** (Priority 2) - Fallback option
3. **Intelligent Mock Data** - Final fallback

## 📋 Setup Instructions

### 1. Get Perplexity API Key
1. Go to [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for **Perplexity Pro** ($20/month)
3. Navigate to API settings
4. Generate your API key

### 2. Configure Environment
Add your Perplexity API key to `backend/.env`:

```bash
# Existing OpenAI key (fallback)
OPENAI_API_KEY=your_openai_api_key_here

# New Perplexity key (priority)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. Test the Setup
```bash
cd backend
source ../venv/bin/activate
python -c "from app.services.llm_service import LLMService; service = LLMService(); print('✅ Perplexity setup successful!')"
```

## 🔄 How It Works

### Priority System:
1. **Perplexity First**: Uses `llama-3.1-sonar-small-128k-online` model
2. **OpenAI Fallback**: Uses `gpt-3.5-turbo` if Perplexity fails
3. **Mock Data**: Intelligent fallback with pre-defined brand knowledge

### Benefits:
- **Better Performance**: Perplexity's models are often faster
- **Reliability**: Fallback system ensures uptime
- **Cost Efficiency**: Perplexity Pro is often cheaper than OpenAI
- **Quality**: Both APIs provide high-quality brand analysis

## 📊 API Comparison

| Feature | Perplexity Pro | OpenAI |
|---------|----------------|--------|
| **Model** | llama-3.1-sonar-small-128k-online | gpt-3.5-turbo |
| **Speed** | ⚡ Fast | 🐌 Slower |
| **Cost** | 💰 $20/month unlimited | 💰 Pay per token |
| **Quality** | 🎯 High | 🎯 High |
| **Fallback** | ✅ Yes | ✅ Yes |

## 🛠️ Troubleshooting

### If Perplexity fails:
1. Check API key is correct
2. Verify Perplexity Pro subscription is active
3. Check network connectivity
4. System will automatically fallback to OpenAI

### If both APIs fail:
1. Check internet connection
2. Verify API keys are valid
3. System will use intelligent mock data
4. Check logs for specific error messages

## 🎯 Expected Results

With Perplexity Pro configured, you should see:
```
🔑 Perplexity API Key configured: pplx-xxxxxxxxxxxxxxxx...
🚀 Attempting Perplexity API request...
✅ Perplexity API request successful
```

## 💡 Tips

1. **Keep both APIs**: Redundancy ensures reliability
2. **Monitor usage**: Check Perplexity dashboard for usage stats
3. **Test regularly**: Ensure both APIs are working
4. **Cache benefits**: Results are cached regardless of API used

## 🔧 Advanced Configuration

You can modify the model in `backend/app/core/config.py`:
```python
PERPLEXITY_MODEL: str = "llama-3.1-sonar-large-128k-online"  # For better quality
```

Available models:
- `llama-3.1-sonar-small-128k-online` (faster, cheaper)
- `llama-3.1-sonar-large-128k-online` (better quality) 