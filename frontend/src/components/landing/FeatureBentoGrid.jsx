import React from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Shield, Zap } from 'lucide-react';

const features = [
  {
    title: "Instant Discovery",
    description: "Find any resource across the campus in milliseconds. Powered by a high-performance index.",
    icon: <Search className="w-6 h-6 text-blue-400" />,
    className: "md:col-span-2 md:row-span-2 text-left justify-end",
  },
  {
    title: "Smart Booking",
    description: "Conflict-free scheduling with automated approvals.",
    icon: <Calendar className="w-6 h-6 text-purple-400" />,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption for all institutional data.",
    icon: <Shield className="w-6 h-6 text-green-400" />,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Lightning Fast",
    description: "Built on an edge-optimized modern stack with instant UI feedback.",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    className: "md:col-span-2 md:row-span-1",
  }
];

const FeatureBentoGrid = () => {
  return (
    <section id="features" className="py-32 px-4 max-w-7xl mx-auto relative z-10 border-t border-subtle">
      <div className="text-center mb-20 space-y-6">
        <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tight">
          Everything you need. <br className="hidden md:block"/>
          <span className="text-muted">Nothing you don't.</span>
        </h2>
        <p className="text-xl text-secondary max-w-2xl mx-auto font-medium">Masterfully engineered to keep your campus running at peak efficiency with zero compromise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[280px]">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`p-8 rounded-3xl border border-subtle flex flex-col justify-between hover:bg-surface/30 transition-all duration-500 group overflow-hidden ${feature.className}`}
            style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(20px)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-raised flex items-center justify-center mb-6 border border-subtle group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-500">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight text-primary">{feature.title}</h3>
              <p className="text-muted leading-relaxed text-sm font-semibold">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeatureBentoGrid;
