# SassGPT

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://sassgpt.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![OpenAI GPT-4o-mini](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green?style=for-the-badge&logo=openai)](https://openai.com)

> **AI Chat with Attitude** - Experience AI conversations with personality, sass, and zero filter.

## 🎯 Overview

SassGPT is a Next.js chat application that brings AI conversations to life with distinct personalities. Unlike traditional AI assistants that are overly polite, SassGPT features AI characters with attitude, humor, and authentic personalities that make conversations more engaging and entertaining.

### ✨ Features

- **🎭 Multiple AI Personalities**: Chat with different AI characters, each with unique attitudes and communication styles
- **💬 Real-time Streaming**: Experience smooth, real-time AI responses with typewriter effects
- **📱 Mobile-First Design**: Fully responsive interface optimized for all devices
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS and Radix UI
- **⚡ Fast Performance**: Built with Next.js 14 and optimized for speed
- **🔄 Auto-scroll**: Smart auto-scrolling that follows conversations naturally
- **📋 Copy & Feedback**: Easy message copying and feedback system
- **🎯 Smart Suggestions**: Contextual conversation starters

## 🚀 Live Demo

**[Try SassGPT →](https://sassgpt.vercel.app)**

## 🎭 AI Personalities

### The Teenager
A moody, sarcastic 16-year-old who thinks they know everything. Uses lots of slang, has zero patience for "adult" questions, and responds with attitude and eye rolls.

### The Grandma
A sweet but brutally honest 78-year-old who loves her family but has zero filter. Gives unsolicited life advice and judges life choices while still being endearing.

### The Intellectual
That guy in his late 20s or early 30s who thinks he's smarter than everyone else. Speaks with smug confidence, references books and cities, and explains things with charm and condescension.

### The Exec
A confident, corporate-sounding leader who turns every answer into a motivational business sermon. Uses buzzwords like synergy, leverage, and optimize.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **AI**: [OpenAI GPT-4o-mini](https://openai.com)
- **Deployment**: [Vercel](https://vercel.com)
- **Language**: TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gichigi/sass-gpt.git
   cd sass-gpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Get your OpenAI API key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy and paste it into `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Troubleshooting

### Common Issues

**"API key not found" error:**
- Ensure `.env.local` exists and contains your OpenAI API key
- Check that the key starts with `sk-` and is valid
- Restart the development server after adding the key

**"Module not found" errors:**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Port already in use:**
- Change the port: `npm run dev -- -p 3001`
- Or kill the process using port 3000

## 📁 Project Structure

```
sass-gpt/
├── app/
│   ├── api/chat/          # API routes for chat functionality
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main chat page
├── components/
│   ├── chat-suggestions.tsx
│   └── typewriter-effect.tsx
├── lib/
│   ├── debug.ts           # Debug utilities
│   ├── openai-client.ts   # OpenAI client configuration
│   └── stream.ts          # Streaming utilities
└── public/                # Static assets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

### AI Personality Customization

Personalities are configured in `app/api/chat/route.ts`. You can modify:

- **System prompts** for each personality
- **Temperature** and **top_p** values for response creativity
- **Max tokens** for response length
- **Response duration** limits

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to contribute.

Here's how you can help:

### 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/gichigi/sass-gpt/issues) with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### 💡 Feature Requests

Have an idea? [Open an issue](https://github.com/gichigi/sass-gpt/issues) with:

- Clear description of the feature
- Use case and benefits
- Any mockups or examples

### 🔨 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### 🎨 Adding New AI Personalities

To add a new AI personality:

1. Add a new configuration in `voiceConfigs` in `app/api/chat/route.ts`
2. Update the personality selector in `app/page.tsx`
3. Test the new personality thoroughly
4. Update this README with the new personality description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for the GPT-4o-mini API
- [Vercel](https://vercel.com) for hosting and deployment
- [Next.js](https://nextjs.org) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com) for accessible UI components

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/gichigi/sass-gpt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gichigi/sass-gpt/discussions)
- **Live Demo**: [sassgpt.vercel.app](https://sassgpt.vercel.app)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=gichigi/sass-gpt&type=Date)](https://star-history.com/#gichigi/sass-gpt&Date)

---

**Made with ❤️ and a lot of sass**

*If you enjoy SassGPT, please consider giving it a ⭐ on GitHub!*