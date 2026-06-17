import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, Sparkles, Shield, Zap, TrendingUp, Eye, EyeOff, Check, X } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    let score = 0;
    let feedback = '';
    let strengthColor = '';
    let strengthText = '';
    
    if (password.length === 0) {
      score = 0;
      feedback = 'Enter a password';
      strengthColor = 'bg-gray-500';
      strengthText = 'Not started';
    } else if (passedChecks <= 2) {
      score = 25;
      feedback = 'Weak password - add more complexity';
      strengthColor = 'bg-red-500';
      strengthText = 'Weak';
    } else if (passedChecks === 3) {
      score = 50;
      feedback = 'Fair password - could be stronger';
      strengthColor = 'bg-yellow-500';
      strengthText = 'Fair';
    } else if (passedChecks === 4) {
      score = 75;
      feedback = 'Good password!';
      strengthColor = 'bg-blue-500';
      strengthText = 'Good';
    } else {
      score = 100;
      feedback = 'Strong password! Excellent security';
      strengthColor = 'bg-green-500';
      strengthText = 'Strong';
    }
    
    return { score, feedback, checks, strengthColor, strengthText };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    const strength = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert('Full name is required');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.match(/^[0-9+\-\s()]{10,15}$/)) {
      alert('Please enter a valid phone number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    if (passwordStrength.score < 50) {
      alert('Please choose a stronger password (at least 8 characters with mixed case, numbers, and special characters)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    if (result.status == 200) navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-darker via-brand-dark to-brand-darker">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Brand */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-primary rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative">
                <h1 className="text-7xl font-bold mb-6">
                  <span className="gradient-bg bg-clip-text text-transparent">Join FinPay</span>
                </h1>
                <p className="text-2xl text-gray-300 mb-8">Start your premium banking journey today</p>
                
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: 'Bank-grade security' },
                    { icon: Zap, text: 'Instant transactions' },
                    { icon: TrendingUp, text: 'Real-time analytics' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center space-x-3 text-gray-300"
                    >
                      <item.icon className="w-5 h-5 text-brand-primary" />
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 p-6 glass-card">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center border-2 border-brand-dark">
                          <span className="text-xs font-bold">U{i}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Join 10,000+ users</p>
                      <p className="text-xs text-gray-400">Start your journey today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 max-w-md mx-auto w-full"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-gray-400">Get started with FinPay today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input-premium pl-12"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-premium pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-premium pl-12"
                    placeholder="+234 801 234 5678"
                    required
                  />
                </div>
              </div>

              {/* Password Field with Strength Checker */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className="input-premium pl-12 pr-12"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    {/* Strength Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Password strength:</span>
                        <span className={`font-semibold ${
                          passwordStrength.score === 100 ? 'text-green-500' :
                          passwordStrength.score >= 75 ? 'text-blue-500' :
                          passwordStrength.score >= 50 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {passwordStrength.strengthText}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.score}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full transition-all ${
                            passwordStrength.score === 100 ? 'bg-green-500' :
                            passwordStrength.score >= 75 ? 'bg-blue-500' :
                            passwordStrength.score >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-400">{passwordStrength.feedback}</p>
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex items-center space-x-2">
                        {passwordStrength.checks.length ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={passwordStrength.checks.length ? 'text-green-500' : 'text-gray-400'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.checks.uppercase ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={passwordStrength.checks.uppercase ? 'text-green-500' : 'text-gray-400'}>
                          Uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.checks.lowercase ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={passwordStrength.checks.lowercase ? 'text-green-500' : 'text-gray-400'}>
                          Lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.checks.number ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={passwordStrength.checks.number ? 'text-green-500' : 'text-gray-400'}>
                          Number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordStrength.checks.special ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={passwordStrength.checks.special ? 'text-green-500' : 'text-gray-400'}>
                          Special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-premium pl-12 pr-12"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <p className="text-xs text-green-500 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Passwords match</span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 flex items-center space-x-1">
                        <X className="w-3 h-3" />
                        <span>Passwords do not match</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Password Security Note */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-xs text-blue-400 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span>Your password is encrypted and never stored in plain text</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full flex items-center justify-center space-x-2 mt-6"
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <p className="text-center text-gray-400 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-semibold">
                Sign in
              </Link>
            </p>

            {/* Terms and Conditions */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-brand-primary hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;