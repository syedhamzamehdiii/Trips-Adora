// Frontend/src/auth/forgotpassword

import { useForm } from 'react-hook-form';
import { FiMail } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const ForgotPasswordForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        icon={<FiMail size={20} />}
        error={errors.email?.message}
        helperText="We'll send you a password reset link"
        {...register('email', { required: 'Email is required' })}
      />

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Send Reset Link
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
