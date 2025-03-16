import React from 'react';
import { X, CreditCard, Shield, Star } from 'lucide-react';
import type { Course } from '../types/database';

interface PaymentModalProps {
  course: Course;
  onClose: () => void;
  onPurchase: () => void;
  processing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  course,
  onClose,
  onPurchase,
  processing
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4 fill-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Full Course Access
            </h2>
            <p className="text-gray-600">
              Get immediate access to all course content and features
            </p>
          </div>

          {/* Course Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Course Price</span>
              <span className="text-2xl font-bold text-gray-900">${course.price}</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-green-500 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Lifetime Access</h4>
                <p className="text-sm text-gray-600">Learn at your own pace with unlimited access</p>
              </div>
            </div>
            <div className="flex items-start">
              <CreditCard className="w-5 h-5 text-green-500 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-600">Your payment information is protected</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onPurchase}
            disabled={processing}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium
              ${processing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors flex items-center justify-center`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ${course.price}
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg text-center text-sm text-gray-600">
          By purchasing, you agree to our Terms of Service
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;