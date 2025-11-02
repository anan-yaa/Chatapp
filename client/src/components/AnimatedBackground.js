import React from 'react';

const AnimatedBackground = () => {
  return (
    <>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-900/50 to-blue-600 animate-pulse-slow"></div>
      <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-blue-400/10 rounded-full blur-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-3/4 left-3/4 w-12 h-12 bg-blue-300/10 rounded-full blur-lg animate-float" style={{ animationDelay: '3s' }}></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-300 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-blue-300 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-blue-500 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-blue-300 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </>
  );
};

export default AnimatedBackground;
