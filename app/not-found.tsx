import { Suspense } from 'react';
import NotFoundContent from './not-found-content';

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}
