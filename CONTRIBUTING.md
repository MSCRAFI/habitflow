# Contributing to HabitFlow 🚀

Thanks for your interest in contributing to HabitFlow! This is my personal hobby project, but I'd love to have others help make it better. No pressure though - contribute what you can, when you can!

## 📋 Table of Contents

- [Quick Links](#-quick-links)
- [Code of Conduct](#-code-of-conduct)
- [Ways to Contribute](#-ways-to-contribute)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Guidelines](#-issue-guidelines)
- [Community Guidelines](#-community-guidelines)
- [Areas for Contribution](#-areas-for-contribution)
- [Release Process](#-release-process)

## 🌟 Quick Links

- [🤝 Code of Conduct](CODE_OF_CONDUCT.md)
- [🔒 Security Policy](SECURITY.md)
- [📖 API Documentation](docs/API_USAGE.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT.md)
- [🐛 Bug Reports](https://github.com/MSCRAFI/habitflow/issues/new?template=bug_report.md)
- [✨ Feature Requests](https://github.com/MSCRAFI/habitflow/issues/new?template=feature_request.md)
- [💬 Discussions](https://github.com/MSCRAFI/habitflow/discussions)

## 🛠️ Ways to Contribute

There are many ways to contribute to HabitFlow:

### 💻 Code Contributions
- Fix bugs and implement new features
- Improve performance and optimize code
- Enhance user interface and experience
- Add comprehensive tests

### 📚 Documentation
- Improve existing documentation
- Write tutorials and guides
- Create API documentation
- Translate documentation to other languages

### 🎨 Design & UX
- Design new themes and components
- Improve accessibility features
- Create icons and visual assets
- Conduct user experience research

### 🧪 Testing & Quality Assurance
- Write unit and integration tests
- Perform manual testing
- Review pull requests
- Improve code coverage

### 🌍 Community
- Answer questions in discussions
- Help newcomers get started
- Organize community events
- Share the project with others

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. 

Please report unacceptable behavior to [salman@scrafi.dev](mailto:salman@scrafi.dev).

**Quick Summary:**
- Be respectful and inclusive in all interactions
- Focus on constructive feedback and collaboration
- Help create a welcoming environment for all contributors
- Respect diverse perspectives and experiences

For complete details, please read our [full Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git knowledge
- Basic understanding of Django and React

### Development Environment Setup

#### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/MSCRAFI/habitflow.git
cd habitflow
git remote add upstream https://github.com/MSCRAFI/habitflow.git
```

#### 2. Environment Setup
```bash
# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install poetry
poetry install
cp .env.example .env

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
```

#### 3. Database Setup
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser  # Optional but recommended
# python manage.py loaddata fixtures/sample_data.json  # Load sample data (not available yet)
```

#### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm start
```

### 🐳 Docker Development (Recommended)
```bash
# Quick setup with Docker
docker-compose up -d
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py createsuperuser
```

## 🔄 Development Workflow

### Branch Naming Convention
```
feature/short-description     # New features
bugfix/issue-number          # Bug fixes
hotfix/critical-issue        # Critical production fixes
docs/documentation-update    # Documentation changes
refactor/component-name      # Code refactoring
```

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding missing tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(habits): add habit stacking functionality
fix(api): resolve authentication token refresh issue
docs: update API documentation for forest endpoints
test(frontend): add unit tests for habit form validation
```

### Daily Development Flow
```bash
# Start your day
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# Work on your feature
# ... make changes ...

# Before committing
make lint          # Run linting
make test          # Run tests
make format        # Format code

# Commit your changes
git add .
git commit -m "feat: add amazing new feature"

# Push and create PR
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

## 📏 Code Standards

### Backend (Python/Django)

#### Code Style
- **Formatter**: Black (line length: 100)
- **Import sorting**: isort
- **Linting**: flake8, pylint
- **Type checking**: mypy

```bash
# Run all code quality checks
make quality

# Individual tools
black .
isort .
flake8
mypy .
```

#### Django Best Practices
- Use Django's built-in features (ORM, forms, admin)
- Follow Django naming conventions
- Use class-based views for complex logic
- Implement proper error handling
- Use Django's security features (CSRF, SQL injection prevention)

#### Example Code Structure
```python
"""
Docstring explaining the module purpose.
"""
from typing import List, Optional

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Habit(models.Model):
    """A user's habit with tracking capabilities."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    
    def __str__(self) -> str:
        return f"{self.title} - {self.user.username}"
    
    def update_streak(self) -> None:
        """Update the current streak based on completion entries."""
        # Implementation here
        pass
```

### Frontend (React/TypeScript)

#### Code Style
- **Formatter**: Prettier
- **Linting**: ESLint (extends React App)
- **Type checking**: TypeScript (when applicable)

```bash
# Frontend code quality
npm run lint
npm run format
npm run type-check
```

#### React Best Practices
- Use functional components with hooks
- Implement proper error boundaries
- Use React Context for global state
- Follow component composition patterns
- Implement loading and error states

#### Example Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HabitList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      // API call logic
    } catch (err) {
      setError('Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="habit-list">
      {/* Component JSX */}
    </div>
  );
};

export default HabitList;
```

## 🧪 Testing Guidelines

### Backend Testing
```bash
cd backend
pytest                           # Run all tests
pytest --cov=.                  # With coverage
pytest -x                       # Stop on first failure
pytest habits/tests/            # Test specific app
```

#### Test Structure
```python
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from habits.models import Habit

User = get_user_model()


class HabitModelTests(TestCase):
    """Test cases for Habit model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_habit_creation(self):
        """Test habit creation with valid data."""
        habit = Habit.objects.create(
            user=self.user,
            title='Test Habit',
            category='health'
        )
        self.assertEqual(habit.title, 'Test Habit')
        self.assertEqual(habit.current_streak, 0)
    
    def test_habit_str_representation(self):
        """Test habit string representation."""
        habit = Habit.objects.create(
            user=self.user,
            title='Test Habit'
        )
        expected = f"Test Habit - {self.user.username}"
        self.assertEqual(str(habit), expected)
```

### Frontend Testing
```bash
cd frontend
npm test                         # Run all tests
npm run test:coverage           # With coverage report
npm test -- --watch            # Watch mode
```

#### Test Structure
```jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import HabitForm from '../components/HabitForm';

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('HabitForm', () => {
  test('renders form fields correctly', () => {
    renderWithAuth(<HabitForm />);
    
    expect(screen.getByLabelText(/habit title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create habit/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    renderWithAuth(<HabitForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/habit title/i), {
      target: { value: 'Test Habit' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /create habit/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Habit',
        // ... other form data
      });
    });
  });
});
```

## 🔍 Pull Request Process

### Before Creating a PR
1. **Sync with main branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run quality checks**:
   ```bash
   make test-all    # Run all tests
   make quality     # Code formatting and linting
   ```

3. **Update documentation** if needed

### PR Checklist
- [ ] **Code quality**: All linting and formatting checks pass
- [ ] **Tests**: New features include tests, all tests pass
- [ ] **Documentation**: Updated README, API docs, or code comments
- [ ] **No breaking changes**: Unless discussed and approved
- [ ] **Small scope**: PR focuses on a single feature/fix
- [ ] **Clear description**: Title and description explain the changes

### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Added tests for new functionality
- [ ] All existing tests pass
- [ ] Manually tested the changes

## Screenshots (if applicable)
Add screenshots or GIFs showing the changes.

## Related Issues
Closes #123
```

### Review Process
1. **Automated checks**: All CI/CD checks must pass
2. **Code review**: At least one maintainer review required
3. **Testing**: Manual testing in development environment
4. **Documentation**: Ensure docs are updated if needed

## 📝 Issue Guidelines

### Bug Reports
Use the bug report template and include:
- **Environment details**: OS, browser, versions
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots/logs**: Visual evidence of the issue

### Feature Requests
Use the feature request template and include:
- **Problem statement**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches evaluated
- **Additional context**: Mockups, examples, references

### Questions and Discussions
- **Search first**: Check existing issues and discussions
- **Be specific**: Provide context and examples
- **Use appropriate labels**: Help categorize your issue

## 🏷️ Labels and Project Management

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation needs update
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: Critical issues
- `priority: medium`: Important issues
- `priority: low`: Nice-to-have features

### Milestones
- **v1.1**: Next minor release
- **v2.0**: Major release with breaking changes
- **Backlog**: Future considerations

## 👥 Community Guidelines

### Getting Help
- **Discord**: [Join our Discord server](https://discord.gg/zDtbnA45mM)
- **Discussions**: Use GitHub Discussions for questions
- **Stack Overflow**: Tag with `habitflow` for coding questions
- **Security Issues**: See our [Security Policy](SECURITY.md) for reporting vulnerabilities
- **Direct Contact**: salman@scrafi.dev

### Recognition
I try to recognize contributors through:
- **Contributors file**: Listed in CONTRIBUTORS.md
- **Release notes**: Mentioned in changelog
- **Social media shoutouts**: When I remember to post!

### Help Available
Since this is a hobby project, I can offer:
- **Good first issues**: I'll try to label beginner-friendly tasks
- **Code reviews**: I'll do my best to give helpful feedback
- **Documentation**: I maintain guides as time permits

## 🎯 Areas for Contribution

### High Priority
- 🐛 **Bug fixes**: Issues labeled `bug` and `priority: high`
- 📚 **Documentation**: API docs, user guides, code comments
- 🧪 **Testing**: Increase test coverage, add integration tests
- ♿ **Accessibility**: WCAG compliance, keyboard navigation

### Medium Priority
- 🎨 **UI/UX improvements**: New themes, animations, responsive design
- ⚡ **Performance**: Database optimization, frontend performance
- 🌐 **Internationalization**: Multi-language support
- 📱 **Mobile**: React Native app development

### Future/Advanced
- 🤖 **AI features**: Habit recommendations, progress predictions
- 📊 **Advanced analytics**: Data visualization, insights
- 🔌 **Integrations**: Third-party service connections
- 🏗️ **Architecture**: Microservices, GraphQL, real-time features

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule
- **Major releases**: Quarterly (Q1, Q2, Q3, Q4)
- **Minor updates**: Monthly when features are ready
- **Bug fixes**: As needed for critical issues
- **Next planned release**: Q1 2026

---

Thanks for considering contributing to HabitFlow! It's been a fun project to work on, and any help is appreciated. 🌟

Questions? Create a [GitHub Discussion](https://github.com/MSCRAFI/habitflow/discussions) or email me at salman@scrafi.dev
