import { Suspense } from 'react';
import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
