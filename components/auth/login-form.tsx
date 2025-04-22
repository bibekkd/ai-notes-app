'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
        setIsLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });
        
        if (error) throw error;
        
        router.push('/dashboard');
        router.refresh();
        } catch (error: any) {
        setError(error.message || 'Failed to sign in');
        } finally {
        setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
        setIsLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
            redirectTo: `https://qzeuxlrkitvvpjwrugpx.supabase.co/auth/v1/callback`,
            },
        });
        
        if (error) throw error;
        } catch (error: any) {
        setError(error.message || 'Failed to sign in with Google');
        setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
            {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                {...register('email')} 
                />
                {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                />
                {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            </form>
            
            <div className="my-4 flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
            </div>
            
            <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            Sign in with Google
            </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
            Dont have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800">
                Sign up
            </Link>
            </p>
        </CardFooter>
        </Card>
    );
}