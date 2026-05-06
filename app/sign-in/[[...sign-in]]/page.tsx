import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Budget Command Center</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
