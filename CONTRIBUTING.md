# Contributing to SassGPT

Thank you for your interest in contributing to SassGPT! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm
- OpenAI API key
- Git

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/sass-gpt.git`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.example .env.local`
5. Add your OpenAI API key to `.env.local`
6. Run the development server: `npm run dev`

## 🎯 How to Contribute

### Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide expected vs actual behavior
- Include system information (OS, Node version, etc.)

### Feature Requests
- Check existing issues first
- Provide clear description of the feature
- Explain the use case and benefits
- Consider implementation complexity

### Code Contributions
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages: `git commit -m "Add amazing feature"`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🎨 Adding New AI Personalities

To add a new AI personality:

1. **Update the voice configuration** in `app/api/chat/route.ts`:
   ```typescript
   newPersonality: {
     systemPrompt: `Your personality description here...`,
     temperature: 0.8,
     top_p: 0.9,
     max_tokens: 800,
     maxDuration: 45,
   }
   ```

2. **Add to the personality selector** in `app/page.tsx`

3. **Update the brand voice guide** in `BRAND_VOICE.md`

4. **Test thoroughly** with various conversation types

## 📝 Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## 🧪 Testing

- Test your changes locally
- Ensure all AI personalities work correctly
- Test on different screen sizes
- Verify auto-scroll functionality
- Check for console errors

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style
- [ ] All tests pass
- [ ] Documentation updated if needed
- [ ] No console errors
- [ ] Works on mobile and desktop

### PR Description
- Clear title describing the change
- Detailed description of what was changed
- Screenshots for UI changes
- Link to related issues

## 🎭 Brand Voice Guidelines

When contributing to AI personalities, follow the brand voice guide in `BRAND_VOICE.md`:

- **Authentic Personality**: Each character should feel real
- **Zero Filter**: Honest, direct communication
- **Entertaining**: Engaging and memorable
- **Respectful Boundaries**: Sassy but not mean

## 🐛 Reporting Issues

### Bug Reports Should Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/device information

### Feature Requests Should Include:
- Clear description of the feature
- Use case and benefits
- Mockups or examples if applicable
- Consideration of implementation complexity

## 📞 Getting Help

- Check existing issues and discussions
- Join our community discussions
- Create an issue for questions

## 📄 License

By contributing to SassGPT, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SassGPT! 🎉
