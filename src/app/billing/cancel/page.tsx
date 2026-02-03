"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Cancel/warning icon */}
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="mt-2 text-gray-600">
          Your payment was not processed. No charges were made.
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
          <h2 className="font-medium text-gray-900 mb-2">What happened?</h2>
          <p className="text-sm text-gray-600">
            You cancelled the checkout process before completing payment.
            Your account has not been charged and no subscription was created.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/pricing"
            className="w-full py-3 px-4 rounded-lg font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-lg font-medium border text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-lg font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Questions? Contact us at support@promptai.com</p>
        </div>
      </div>
    </main>
  );
}
