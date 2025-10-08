import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const LoginForm = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        icon={<FiMail size={20} />}
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon={<FiLock size={20} />}
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;