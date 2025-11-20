# 🔒 Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of HabitFlow:

| Version | Supported          | End of Support |
| ------- | ------------------ | -------------- |
| 1.0.x   | ✅ Currently supported | TBD            |
| < 1.0   | ❌ Not supported       | November 2025  |

## 🚨 Reporting a Vulnerability

While this is a hobby project, I do take security seriously! If you find something concerning, I'd appreciate you letting me know so I can fix it.

### Reporting Process

**🔴 Critical Security Issues**: Please report these quickly

**📧 Email**: salman@scrafi.dev
- Include detailed information about the vulnerability
- Provide steps to reproduce if applicable
- Use subject line: "[SECURITY] HabitFlow Vulnerability Report"

**🔒 Private GitHub Security Advisory**: [Create a security advisory](https://github.com/MSCRAFI/habitflow/security/advisories/new)

### What to Include in Your Report

Please provide as much information as possible to help us understand and reproduce the issue:

1. **Vulnerability Description**
   - Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
   - Impact assessment (data exposure, privilege escalation, etc.)

2. **Affected Components**
   - Specific files, functions, or endpoints affected
   - Version information
   - Environment details (if relevant)

3. **Reproduction Steps**
   - Step-by-step instructions to reproduce the vulnerability
   - Proof-of-concept code (if applicable)
   - Screenshots or videos (if helpful)

4. **Suggested Fix** (optional)
   - Proposed solution or mitigation
   - Code patches (if available)

### Response Timeline

Since this is a personal project, I can't guarantee specific timelines, but I'll do my best:

| Timeframe | Action |
|-----------|--------|
| **1-2 days** | I'll acknowledge your report |
| **1 week** | Initial assessment when I have time |
| **As needed** | Fix and deploy when possible |
| **Eventually** | Update you on progress |

## 🛡️ Security Measures

### Application Security

#### Backend (Django)
- **Authentication**: JWT-based authentication with refresh token rotation
- **Authorization**: Role-based access control with permission checks
- **Input Validation**: Comprehensive input sanitization and validation
- **SQL Injection Prevention**: Django ORM with parameterized queries
- **CSRF Protection**: Django CSRF middleware enabled
- **XSS Prevention**: Template auto-escaping and CSP headers
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting**: API throttling and DDoS protection
- **Session Security**: Secure session configuration

#### Frontend (React)
- **XSS Prevention**: React's built-in XSS protection
- **Content Security Policy**: Strict CSP implementation
- **Secure Dependencies**: Regular dependency vulnerability scanning
- **Environment Variables**: Secure handling of sensitive configuration
- **HTTPS Enforcement**: All communications encrypted in transit

### Infrastructure Security

#### Database
- **PostgreSQL**: Secure database configuration
- **Encryption**: Data encryption at rest and in transit
- **Access Control**: Principle of least privilege
- **Backup Security**: Encrypted backup storage

#### Deployment
- **HTTPS/TLS**: SSL/TLS encryption for all communications
- **Environment Isolation**: Separate staging and production environments
- **Secret Management**: Secure handling of API keys and secrets
- **Container Security**: Docker security best practices

### Development Security

#### Code Quality
- **Static Analysis**: Automated security scanning (bandit, safety)
- **Dependency Scanning**: Regular vulnerability assessment of dependencies
- **Code Review**: Mandatory security-focused code reviews
- **Pre-commit Hooks**: Automated security checks before commits

#### Testing
- **Security Testing**: Dedicated security test suite
- **Penetration Testing**: Regular third-party security assessments
- **Dependency Updates**: Automated security patch management

## 🔍 Vulnerability Categories

We are particularly interested in reports concerning:

### High Priority
- **Authentication Bypass**: Unauthorized access to user accounts
- **Authorization Flaws**: Privilege escalation or access control issues
- **Data Exposure**: Unauthorized access to sensitive user data
- **SQL Injection**: Database manipulation vulnerabilities
- **Remote Code Execution**: Server-side code execution

### Medium Priority
- **Cross-Site Scripting (XSS)**: Client-side code injection
- **Cross-Site Request Forgery (CSRF)**: Unauthorized state changes
- **Information Disclosure**: Unintended information leakage
- **Business Logic Flaws**: Application workflow vulnerabilities

### Lower Priority
- **Rate Limiting Issues**: API abuse potential
- **Session Management**: Session handling vulnerabilities
- **Input Validation**: Data validation bypasses

## 🚫 Out of Scope

The following are generally **not** considered security vulnerabilities:

- **Social Engineering**: Issues requiring user interaction beyond normal usage
- **Physical Access**: Vulnerabilities requiring physical access to devices
- **Denial of Service**: DoS attacks without data exposure or system compromise
- **Self-XSS**: XSS requiring victim to paste malicious content
- **Open Redirect**: Redirects to external sites (unless part of a larger attack)
- **Missing Security Headers**: Without demonstrable security impact
- **Theoretical Vulnerabilities**: Without practical exploitation path

## 🏆 Recognition Program

We believe in recognizing security researchers who help improve HabitFlow's security:

### Hall of Fame
Security researchers who report valid vulnerabilities will be:
- Listed in our security acknowledgments (with permission)
- Credited in release notes for security fixes
- Invited to our private security researcher Discord channel

### Bounty Program
As a hobby project, I can't offer monetary rewards, but I really appreciate security reports and will:
- Credit you in the security acknowledgments (if you want)
- Give you a shout-out on social media
- Provide a direct line of communication for future discussions

## 📚 Security Resources

### For Developers
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

### For Users
- **Strong Passwords**: Use unique, complex passwords
- **Two-Factor Authentication**: Enable 2FA when available
- **Regular Updates**: Keep your browser and devices updated
- **Secure Networks**: Avoid using HabitFlow on public Wi-Fi

## 📞 Contact Information

### Contact Information
- **Email**: salman@scrafi.dev
- **Response**: I check email regularly but this is a hobby project!

### Emergency Contact
For critical security issues:
- **Email**: salman@scrafi.dev
- **Response**: I'll try to respond as quickly as possible

## 📄 Legal

### Safe Harbor
HabitFlow supports responsible disclosure and will not pursue legal action against researchers who:
- Make a good faith effort to avoid privacy violations and disruptions
- Only interact with accounts they own or with explicit permission
- Do not access, modify, or delete user data beyond what is necessary to demonstrate the vulnerability
- Contact us immediately if they inadvertently access sensitive data

### Disclosure Policy
- We prefer coordinated disclosure with a 90-day timeline
- We will credit researchers unless they prefer to remain anonymous
- We may request additional time for complex vulnerabilities
- Public disclosure details will be coordinated with the reporter

---

**Thank you for helping keep HabitFlow and our users safe! 🙏**

*Last updated: November 2025*
*Version: 1.0*