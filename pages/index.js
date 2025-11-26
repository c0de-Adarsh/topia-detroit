import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Confetti from 'react-confetti';
import Image from 'next/image';

const CheckIn = () => {
  const [formData, setFormData] = useState({ phone: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [loginImage, setLoginImage] = React.useState(null);

  React.useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Load check-in image from API (using Login page image)
  React.useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch('https://api.mypsyguide.io/api/pagesetting?pagename=Login');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.length > 0) {
            const imageUrl = result.data[0].image;
            setLoginImage(imageUrl.startsWith('http') ? imageUrl : `https://api.mypsyguide.io${imageUrl}`);
          }
        }
      } catch (error) {
        console.error('Error loading check-in image:', error);
      }
    };
    loadImage();
  }, []);

  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
    const phoneWithPlus = '+' + value;
    setFormData({ phone: phoneWithPlus });

    const phoneNumber = parsePhoneNumberFromString(phoneWithPlus);
    if (phoneNumber) {
      if (!phoneNumber.isValid()) {
        setError('Please enter a valid phone number');
      } else {
        setError('');
      }
    } else {
      setError('Please enter a valid phone number');
    }
  };

  const handleCheckIn = async () => {
    if (!formData.phone || formData.phone.trim() === '') {
      setError('Please enter your phone number');
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(formData.phone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('https://api.mypsyguide.io/api/visitors/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const result = await response.json();

      if (result.success) {
        setVisitorData(result.data);
        setShowWelcome(true);
        
        // Auto-close after 30 seconds
        setTimeout(() => {
          setShowWelcome(false);
          setPhoneNumber('');
          setFormData({ phone: '' });
          setVisitorData(null);
        }, 30000);
      } else {
        setError(result.message || 'Check-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('An error occurred during check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = phoneNumber.length >= 10 && !error && formData.phone;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={loginImage || "/images/auth.png"}
          alt="Wellness background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Check-in Form */}
      <div className="w-full lg:w-2/3 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-24  rounded-full flex items-center justify-center ">
              <Image src="/new.jpg" alt="Logo" width={180} height={180} />
            </div>
          </div>
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-700 mb-3">
              Welcome to your Topia 
            </h1>
            <p className="text-gray-600 text-lg">Your wellness journey starts here</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-base font-semibold mb-3">
                Check-in with your phone number
              </label>

              <PhoneInput
                country={'us'}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                  placeholder: 'Enter phone number',
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5A81D7] focus:border-transparent text-gray-700 placeholder-gray-500'
                }}
                containerClass="w-full"
                buttonStyle={{
                  position: 'absolute',
                  border: 'none',
                  background: 'transparent',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}
                inputStyle={{
                  width: '100%',
                  paddingLeft: '50px',
                  height: '50px'
                }}
                containerStyle={{
                  position: 'relative'
                }}
                dropdownClass="rounded-lg shadow-md text-gray-700"
                enableSearch={true}
                preferredCountries={['us', 'in', 'gb', 'ca', 'au']}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-4 rounded-xl flex items-start">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckIn}
              disabled={loading || !isFormFilled}
              className={`w-full ${
                isFormFilled
                  ? 'bg-[#6B92E8] hover:bg-[#4A71C7]'
                  : 'bg-[#6B92E8]'
              } text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#5A81D7] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg shadow-lg`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking in...
                </span>
              ) : (
                'Check-In Now'
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-700 text-sm">
                Elevate your wellness naturally with therapeutic mushrooms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Animation */}
      {showWelcome && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={250}
            gravity={0.15}
            colors={['#80A6F7', '#6B92E8', '#FFFFFF', '#FFD700']}
          />
          
          {/* Background - Click to Close */}
          <div 
            className="fixed inset-0 z-50 cursor-pointer"
            onClick={() => {
              setShowWelcome(false);
              setPhoneNumber('');
              setFormData({ phone: '' });
              setVisitorData(null);
            }}
          >
            <div className="absolute inset-0 bg-[#80A6F7]"></div>
            


            {/* Main Content */}
            <div className="relative h-full flex items-center justify-center p-4 overflow-hidden">
              {/* Close Button - Top Right */}
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setPhoneNumber('');
                  setFormData({ phone: '' });
                  setVisitorData(null);
                }}
                className="absolute top-8 right-8 w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content - No White Box */}
              <div className="relative max-w-2xl w-full text-center transform animate-epic-entrance max-h-screen overflow-y-auto scrollbar-hide py-8">
                {/* Success Icon with Epic Sparkles */}
                <div className="mb-6 relative pt-4">
                  {/* Glow Rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full bg-white/20 animate-ping-slow"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center animation-delay-300">
                    <div className="w-32 h-32 rounded-full bg-white/30 animate-ping-slow"></div>
                  </div>
                  
                  {/* Main Icon */}
                  <div className="relative w-32 h-32 bg-white rounded-full mx-auto flex items-center justify-center animate-bounce-in shadow-2xl">
                    <svg className="w-16 h-16 text-[#80A6F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Celebration Stars */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-sparkle"
                      style={{
                        left: `${50 + 60 * Math.cos((i * Math.PI * 2) / 12)}%`,
                        top: `${50 + 60 * Math.sin((i * Math.PI * 2) / 12)}%`,
                        animationDelay: `${i * 0.08}s`
                      }}
                    >
                      {/* Star Shape */}
                      <svg className="w-6 h-6 text-yellow-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  ))}
                </div>

               
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                  Welcome to SHROOMTOPIA!
                </h1>
                
                {/* User Name */}
                {visitorData?.userName && (
                  <p className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg">
                    Hello, {visitorData.userName}! 👋
                  </p>
                )}
                
                {/* Status Badge */}
                <div className="space-y-3 mb-6">
                  {visitorData?.isMember ? (
                    <div className="bg-white/20 backdrop-blur-sm border-3 border-white rounded-2xl p-4 transform hover:scale-105 transition-transform">
                      <p className="text-2xl font-black text-white drop-shadow-lg">✨ VALUED MEMBER ✨</p>
                      <p className="text-white text-base mt-1 font-semibold">Thank you for being part of our community!</p>
                    </div>
                  ) : (
                    <div className="bg-white/20 backdrop-blur-sm border-3 border-white rounded-2xl p-4 transform hover:scale-105 transition-transform">
                      <p className="text-2xl font-black text-white drop-shadow-lg">👋 WELCOME VISITOR! 🎉</p>
                      <p className="text-white text-base mt-1 font-semibold">We're excited to have you here!</p>
                    </div>
                  )}
                  
                  {visitorData?.isNewVisitor && (
                    <div className="bg-white/20 backdrop-blur-sm border-3 border-white rounded-2xl p-4 transform hover:scale-105 transition-transform">
                      <p className="text-xl font-black text-white drop-shadow-lg">🎉 FIRST VISIT! 🎊</p>
                      <p className="text-white text-base mt-1 font-semibold">Welcome to your wellness journey!</p>
                    </div>
                  )}
                </div>
                
                {/* Tagline */}
                <p className="text-xl text-white mb-4 font-bold drop-shadow-lg">
                  Discover the power of therapeutic mushrooms today! 🌿
                </p>
                
                {/* Footer */}
                <div className="text-base text-white/90 mb-6 font-semibold">
                  <p>Enhancing your wellness journey through nature's gifts</p>
                </div>

                {/* Got It Button */}
                {/* <button
                  onClick={() => {
                    setShowWelcome(false);
                    setPhoneNumber('');
                    setFormData({ phone: '' });
                    setVisitorData(null);
                  }}
                  className="bg-white text-[#80A6F7] hover:bg-gray-100 font-black py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-110 shadow-2xl text-lg"
                >
                  Got It! ✨
                </button> */}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }

        @keyframes epic-entrance {
          0% {
            opacity: 0;
            transform: scale(0.5) rotateX(-30deg);
          }
          50% {
            transform: scale(1.05) rotateX(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateX(0deg);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }

        @keyframes text-reveal {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }

        .animate-epic-entrance {
          animation: epic-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-draw-check {
          stroke-dasharray: 100;
          animation: draw-check 0.5s ease-out 0.3s forwards;
        }

        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }

        .animate-text-reveal {
          animation: text-reveal 0.6s ease-out;
        }

        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradient-text 3s linear infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out 0.3s both;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out 0.5s both;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out 0.7s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-progress-bar {
          animation: progress-bar 5s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default CheckIn;
