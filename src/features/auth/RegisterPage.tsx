import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials, setLoading, setError } from './authSlice';
import { authService } from './authService';
import { parseError } from '../../utils/errorParser';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim().optional().refine((value) => !value || /^\d{10}$/.test(value), {
    message: 'Phone must be a 10-digit number',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipcode: z.string().min(1, 'Zipcode is required'),
  country: z.string().min(1, 'Country is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          country: data.country,
        },
      });
      dispatch(setCredentials(response));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const message = parseError(err);
      dispatch(setError(message));
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Join us today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone (optional)"
            placeholder="9876543210"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900">Address</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Street"
                placeholder="MG Road"
                error={errors.street?.message}
                {...register('street')}
              />
              <Input
                label="City"
                placeholder="Bengaluru"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State"
                placeholder="Karnataka"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="Zipcode"
                placeholder="560001"
                error={errors.zipcode?.message}
                {...register('zipcode')}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Country"
                  placeholder="India"
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
            </div>
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
