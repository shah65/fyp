import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white/10 backdrop-blur-md border-t border-white/20 p-6 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left side: Info */}
        <div className="text-white/80 text-sm text-center md:text-left">
          <h2 className="text-white font-bold text-lg">
            Abdul Wali Khan University Mardan (AWKUM)
          </h2>
          <p>
            Providing quality education and research opportunities in Khyber Pakhtunkhwa, Pakistan.
          </p>
        </div>

        {/* Right side: Website link */}
        <div className="text-center md:text-right">
          <a
            href="https://www.awkum.edu.pk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 font-semibold hover:text-indigo-200 transition-colors duration-300"
          >
            Official Website
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-4 text-center text-white/50 text-xs">
        &copy; {new Date().getFullYear()} AWKUM. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
