# Contributing Guide

Thank you for considering contributing to Muktamar! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others succeed

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/yourusername/muktamar.git
cd muktamar
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use clear branch names:
- `feature/` for new features
- `bugfix/` for bug fixes
- `docs/` for documentation
- `refactor/` for refactoring

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Create `.env.local` for Development

```bash
cd backend
cp .env.example .env.local
# Edit with your local settings

cd ../frontend
cp .env.example .env.local
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:coverage
```

### Linting and Formatting

```bash
# Lint
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

### Making Changes

1. **Create a feature or fix**
   - Write the code
   - Add/update tests
   - Update documentation

2. **Test your changes**
   ```bash
   pnpm run test
   pnpm run lint
   ```

3. **Keep commits atomic**
   - One logical change per commit
   - Use clear commit messages

## Commit Messages

Follow conventional commit format:

```
type(scope): subject

body

footer
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test changes
- `chore`: Build, dependencies, etc.

### Examples

```
feat(invitations): add bulk email sending

- Implement batch invitation sending
- Add job queue processing
- Include error handling and retry logic

Closes #123
```

```
fix(auth): prevent token reuse attacks

Validates token hasn't been used before and invalidates
on logout to prevent replay attacks.

Fixes #456
```

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows project style guide
- [ ] Tests pass: `pnpm run test`
- [ ] Linting passes: `pnpm run lint`
- [ ] Documentation updated
- [ ] No unnecessary dependencies added
- [ ] Commits are clear and atomic

### 2. Create Pull Request

Use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Ready for review
```

### 3. Code Review

- Be open to feedback
- Discuss alternative approaches
- Make requested changes
- Re-request review after updates

## Code Style Guide

### Backend (Node.js)

```javascript
// Use ES6+ syntax
const getData = async (id) => {
  try {
    const result = await db.query(id);
    return result;
  } catch (error) {
    logger.error('Error:', error);
    throw error;
  }
};

// Use meaningful names
const isValidEmail = (email) => EMAIL_REGEX.test(email);

// Add JSDoc comments for exported functions
/**
 * Send invitation email
 * @param {string} email - Recipient email
 * @returns {Promise<boolean>} Success status
 */
export async function sendInvitation(email) {
  // ...
}
```

### Frontend (React/TypeScript)

```typescript
// Use proper TypeScript
interface Props {
  agmId: string;
  onSuccess: () => void;
}

// Use functional components with hooks
export const MyComponent: React.FC<Props> = ({ agmId, onSuccess }) => {
  const [state, setState] = useState('');

  useEffect(() => {
    // ...
  }, [agmId]);

  return <div>{/* ... */}</div>;
};

// Use meaningful component names
// ✓ UserAuthForm
// ✗ Form, MyComponent
```

## Testing Guidelines

### Backend Tests

```javascript
describe('Module Name', () => {
  describe('Function Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Frontend Tests

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('should handle click', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    // Assert behavior
  });
});
```

## Documentation

### Code Comments

```javascript
// Good: Explains why, not what
// We use SHA256 instead of MD5 for security
const hash = crypto.createHash('sha256');

// Bad: Obvious from code
// Create a hash
const hash = crypto.createHash('sha256');
```

### README Updates

If your change affects:
- Installation process
- Configuration
- API endpoints
- Environment variables

Update the relevant documentation.

### API Documentation

If adding API endpoints, document in `docs/API.md`:

```markdown
### Endpoint Name
Brief description

\`\`\`http
METHOD /path/:id
Authorization: Bearer <token>
Content-Type: application/json

Request body
\`\`\`

Response example
```

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)
- Error logs/screenshots

### Feature Requests

Include:
- Clear description
- Use case/benefit
- Example usage
- Potential implementation approach

## Development Resources

### Useful Commands

```bash
# Start development servers
pnpm run dev

# Run tests in watch mode
cd backend && pnpm run test:watch

# Format all code
pnpm run format

# Check type errors (frontend)
cd frontend && pnpm run type-check

# Run database migration
cd backend && pnpm run migrate:latest

# Create new migration
cd backend && pnpm run migrate:make migration_name
```

### Documentation

- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions?

- Check existing issues and PRs
- Read documentation in `docs/`
- Ask in issues with `question` label

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing! 🎉
