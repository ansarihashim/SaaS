import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  className = '',
  error = false
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const baseClasses = error
    ? 'w-full px-4 py-3 pr-12 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed'
    : 'w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${baseClasses} ${className}`}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? (
          <FiEyeOff className="w-5 h-5" />
        ) : (
          <FiEye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
