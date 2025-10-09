// Frontend/src/components/auth/RegisterForm.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiMapPin } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const RegisterForm = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Business Name"
          placeholder="Enter business name"
          icon={<FiUser size={20} />}
          error={errors.businessName?.message}
          {...register('businessName', { required: 'Business name is required' })}
        />
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          icon={<FiUser size={20} />}
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Full name is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter email"
          icon={<FiMail size={20} />}
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="Enter phone"
          icon={<FiPhone size={20} />}
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
      </div>

      <Input
        label="Address"
        placeholder="Enter address"
        icon={<FiMapPin size={20} />}
        error={errors.address?.message}
        {...register('address', { required: 'Address is required' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create password"
            icon={<FiLock size={20} />}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required', minLength: 8 })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            icon={<FiLock size={20} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;