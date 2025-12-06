// src/components/HowItWorks.jsx
import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Book a Service",
    desc: "Choose from our curated services and book in seconds — transparent pricing, clear variants.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Choose Slot",
    desc: "Pick a convenient date & time slot. Get ETA info and a certified technician assigned.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Service Delivered",
    desc: "Technician arrives, completes the job professionally and securely. Contactless options available.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4s-3 1.567-3 3.5S10.343 11 12 11z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    )
  },
  {
    id: 4,
    title: "Warranty & Support",
    desc: "Raise warranty requests if required. Ratings and feedback help us keep quality high.",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.29 4.64L19 8l-4 3.09L16.18 17 12 14.27 7.82 17 9 11.09 5 8l4.71-.36L12 2z" />
      </svg>
    )
  }
];

export default function HowItWorks({ className = "" }) {
  return (
    <section className={`py-10 sm:py-14 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">How it works</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            A simple, transparent process — from booking to completion and support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-blue-600">
                  {step.icon}
                </div>
                <div className="text-xs text-gray-400 font-semibold">Step {step.id.toString().padStart(2, "0")}</div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-800">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.desc}</p>

              
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
