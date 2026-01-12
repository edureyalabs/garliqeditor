'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Wand2,
  Scissors,
  Palette,
  Upload,
  MessageSquare,
  Download,
  Video,
  Zap,
  Linkedin
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// Feature Card Component
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay = 0,
  color = 'blue'
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  color?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 from-blue-500 to-blue-600 hover:border-blue-500 hover:shadow-blue-500/30',
    cyan: 'bg-cyan-500 from-cyan-500 to-cyan-600 hover:border-cyan-500 hover:shadow-cyan-500/30',
    teal: 'bg-teal-500 from-teal-500 to-teal-600 hover:border-teal-500 hover:shadow-teal-500/30',
    green: 'bg-green-500 from-green-500 to-green-600 hover:border-green-500 hover:shadow-green-500/30',
    yellow: 'bg-yellow-500 from-yellow-500 to-yellow-600 hover:border-yellow-500 hover:shadow-yellow-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500 hover:bg-gray-900/80"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
};

// Main Landing Page
export default function Landing() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-[1000] bg-black/80 border-b border-gray-800 backdrop-blur-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Image src="/logo.png" alt="GarliQ Logo" width={40} height={40} className="rounded-full" />
                  </div>
                  <h1 className="text-xl font-semibold text-white">GarliQ</h1>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <Link href="#features">
                  <span className="text-sm text-gray-300 hover:text-blue-400 cursor-pointer transition-all">Features</span>
                </Link>
                <Link href="#how-it-works">
                  <span className="text-sm text-gray-300 hover:text-blue-400 cursor-pointer transition-all">How It Works</span>
                </Link>
                <Link href="#pricing">
                  <span className="text-sm text-gray-300 hover:text-blue-400 cursor-pointer transition-all">Pricing</span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/auth">
                  <button className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-all">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center gap-2">
                    Start Free
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <div className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/10 border border-blue-500 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-300" />
                <span className="text-blue-300">AI-Powered Video Editing</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl text-white">
                Transform Raw Footage into{' '}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Stunning Videos
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-3xl">
                Say goodbye to complex editing software. GarliQ uses AI to edit your videos automatically—
                just describe what you want, and watch the magic happen.
              </p>

              <div className="pt-4">
                <Link href="/auth">
                  <button className="px-8 h-14 text-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center gap-2">
                    Start Editing Free
                    <ArrowRight size={20} />
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span className="text-gray-300">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span className="text-gray-300">500K free tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span className="text-gray-300">Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center gap-12 text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-block px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500 text-blue-300 text-sm">
                  Features
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Everything You Need to Create
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl">
                  Professional-grade video editing powered by cutting-edge AI technology
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Wand2 size={24} />}
                title="AI-Powered Editing"
                description="Describe your vision in plain English. Our AI understands context and automatically applies cuts, transitions, and effects."
                delay={0}
                color="blue"
              />
              <FeatureCard
                icon={<Scissors size={24} />}
                title="Smart Auto-Cut"
                description="Intelligent scene detection removes dead air, awkward pauses, and unnecessary footage automatically."
                delay={0.1}
                color="cyan"
              />
              <FeatureCard
                icon={<Palette size={24} />}
                title="One-Click Color Grading"
                description="Apply professional color grading instantly. Choose from cinematic presets or let AI match your brand."
                delay={0.2}
                color="teal"
              />
              <FeatureCard
                icon={<Video size={24} />}
                title="Multi-Format Support"
                description="Import any video format. Export for YouTube, Instagram, TikTok, or custom specifications."
                delay={0.3}
                color="green"
              />
              <FeatureCard
                icon={<MessageSquare size={24} />}
                title="Conversational Editing"
                description="Refine your video through chat. Ask for changes and the AI adapts in real-time."
                delay={0.4}
                color="blue"
              />
              <FeatureCard
                icon={<Zap size={24} />}
                title="Lightning Fast"
                description="Process hours of footage in minutes. Our cloud infrastructure ensures blazing-fast rendering."
                delay={0.5}
                color="yellow"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-gray-900/50 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center gap-12 text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-block px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500 text-cyan-300 text-sm">
                  Process
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  From Upload to Export in 3 Steps
                </h2>
                <p className="text-xl text-gray-400">
                  Simple workflow, professional results
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: Upload,
                  title: 'Upload Your Media',
                  description: 'Drag and drop videos, images, and audio. All formats supported, no conversion needed.',
                  color: 'blue'
                },
                {
                  step: '2',
                  icon: MessageSquare,
                  title: 'Describe Your Vision',
                  description: 'Tell our AI what you want. "Add upbeat music and quick cuts" - it\'s that simple.',
                  color: 'cyan'
                },
                {
                  step: '3',
                  icon: Download,
                  title: 'Download & Share',
                  description: 'Get your finished video in minutes. Export in any format, ready for any platform.',
                  color: 'teal'
                }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center relative shadow-[0_0_30px_rgba(59,130,246,0.4)]`}>
                      <IconComponent size={40} className="text-white" />
                      <span className={`absolute -top-2 -right-2 bg-${item.color}-500 text-white text-xs px-2 py-1 rounded-full`}>
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-gray-400 text-center">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center gap-12 text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-block px-3 py-1 rounded-md bg-green-500/10 border border-green-500 text-green-300 text-sm">
                  Pricing
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-400">
                  Pay only for what you use. No subscriptions, no hidden fees.
                </p>
              </motion.div>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-md border-2 border-blue-500 rounded-2xl p-10 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                <div className="flex flex-col items-center gap-6 mb-8">
                  <div className="px-4 py-2 rounded-full text-sm bg-blue-500/10 border border-blue-500 text-blue-300">
                    Token-Based System
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Flexible Pay-As-You-Go</h3>
                  <p className="text-gray-400 text-center">
                    Buy tokens, use them for edits. Tokens never expire.
                  </p>
                </div>

                <div className="bg-black/50 rounded-xl p-8 mb-8 border border-gray-800">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-3xl font-bold text-white">$10</p>
                      <p className="text-xs text-gray-400">500K tokens</p>
                      <p className="text-xs text-gray-500">~10 videos</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-3xl font-bold text-white">$25</p>
                      <p className="text-xs text-gray-400">1.5M tokens</p>
                      <p className="text-xs text-gray-500">~30 videos</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-3xl font-bold text-white">$50</p>
                      <p className="text-xs text-gray-400">3.5M tokens</p>
                      <p className="text-xs text-gray-500">~70 videos</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                  {[
                    '500K free tokens to start',
                    'Tokens never expire',
                    'All features included',
                    'Priority processing',
                    'Email support'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-500" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/auth">
                  <button className="w-full h-14 text-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md hover:opacity-90 transition-all shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2">
                    Get Started Free
                    <ArrowRight size={20} />
                  </button>
                </Link>

                <p className="text-center text-xs text-gray-500 mt-4">
                  No credit card required • Start editing immediately
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-blue-500/5 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Ready to Transform Your
                <br />
                Video Editing Workflow?
              </h2>
              <p className="text-xl text-gray-400">
                Join thousands of creators who are already saving hours with AI-powered editing
              </p>
              <Link href="/auth">
                <button className="px-8 h-14 text-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center gap-2">
                  Start Creating Now
                  <ArrowRight size={20} />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Image src="/logo.png" alt="GarliQ Logo" width={40} height={40} className="rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-white">GarliQ</h3>
                    <p className="text-xs text-gray-500">AI-powered video editing</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-semibold text-sm text-white">Product</p>
                <Link href="#features"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Features</span></Link>
                <Link href="#pricing"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Pricing</span></Link>
                <Link href="/auth"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Sign Up</span></Link>
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-semibold text-sm text-white">Company</p>
                <Link href="/about"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">About</span></Link>
                <Link href="/contact"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Contact</span></Link>
                <Link href="/blog"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Blog</span></Link>
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-semibold text-sm text-white">Legal</p>
                <Link href="/privacy-policy"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Privacy</span></Link>
                <Link href="/terms"><span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">Terms</span></Link>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-sm text-gray-500">
                  © 2025 GarliQ by Parasync Technologies. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="https://x.com/garliq_ai" target="_blank">
                    <div className="w-10 h-10 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-800 hover:border-gray-700 hover:-translate-y-0.5">
                      <span className="font-bold text-white">𝕏</span>
                    </div>
                  </Link>
                  <Link href="https://www.linkedin.com/company/garliq-ai/" target="_blank">
                    <div className="w-10 h-10 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-800 hover:border-gray-700 hover:-translate-y-0.5">
                      <Linkedin size={16} className="text-white" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}