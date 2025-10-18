export const validateLoanRequest = (req, res, next) => {
  const { amount, interestRate, tenure, purpose, description } = req.body;
  const errors = [];

  if (!amount || amount < 100 || amount > 50000) {
    errors.push('Amount must be between $100 and $50,000');
  }

  if (!interestRate || interestRate < 1 || interestRate > 36) {
    errors.push('Interest rate must be between 1% and 36%');
  }

  if (!tenure || tenure < 1 || tenure > 60) {
    errors.push('Tenure must be between 1 and 60 months');
  }

  if (!purpose) {
    errors.push('Purpose is required');
  }

  if (!description || description.length > 500) {
    errors.push('Description is required and must not exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  const errors = [];

  if (!firstName || firstName.length > 50) {
    errors.push('First name is required and must not exceed 50 characters');
  }

  if (!lastName || lastName.length > 50) {
    errors.push('Last name is required and must not exceed 50 characters');
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!role || !['borrower', 'lender'].includes(role)) {
    errors.push('Role must be either borrower or lender');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};