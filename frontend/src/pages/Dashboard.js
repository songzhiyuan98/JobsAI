"use client";

import Navbar from "../components/Navbar";
import HeroSection from "../components/dashboard/HeroSection";
import FeatureSection from "../components/dashboard/FeatureSection";
import TestimonialsSection from "../components/dashboard/TestimonialsSection";
import UploadSection from "../components/dashboard/UploadSection";
import PricingSection from "../components/dashboard/PricingSection";
import Footer from "../components/dashboard/Footer";

// App Component - Main Entry Point
function Dashboard() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <FeatureSection />
      <TestimonialsSection />
      <UploadSection />
      <PricingSection />
      <Footer />
    </main>
  );
}

export default Dashboard;
