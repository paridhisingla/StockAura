"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import CountUp from "react-countup"
import { useInView } from "react-intersection-observer"
import { ChevronDown, TrendingUp, DollarSign, BarChart2, PieChart, Activity } from "lucide-react"

const ParallaxSection = ({ children, speed = 0.5 }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`])

  return (
    <motion.div ref={ref} style={{ y, position: "absolute", inset: 0 }}>
      {children}
    </motion.div>
  )
}

const StatCard = ({ label, value, suffix = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-purple-900 p-6 rounded-lg text-center"
    >
      <h3 className="text-2xl font-bold mb-2 text-white">
        {inView ? <CountUp end={value} duration={2.5} separator="," /> : "0"}
        {suffix}
      </h3>
      <p className="text-purple-200">{label}</p>
    </motion.div>
  )
}

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [activePlan, setActivePlan] = useState(1)

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Real-time Trading",
      description: "Execute trades instantly with live market data",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Portfolio Management",
      description: "Track and manage your investments effortlessly",
    },
    {
      icon: <BarChart2 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Gain insights with powerful analytical tools",
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Diversification Tools",
      description: "Optimize your portfolio with smart allocation",
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Risk Management",
      description: "Set stop-loss and take-profit orders easily",
    },
  ]

  const plans = [
    { name: "Basic", price: "$9.99", features: ["Real-time Quotes", "Basic Charts", "Limited Trades/Month"] },
    {
      name: "Pro",
      price: "$29.99",
      features: ["Advanced Charts", "Unlimited Trades", "Portfolio Analysis", "API Access"],
    },
    {
      name: "Elite",
      price: "$59.99",
      features: ["All Pro Features", "Priority Execution", "Dedicated Support", "Custom Alerts"],
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white overflow-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1 z-50 bg-purple-400 transform-origin-0" style={{ scaleX }} />
      <main className="pt-16">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <ParallaxSection speed={0.2}>
            <div className="absolute inset-0 z-0">
              <img src="/stock-background.jpg" alt="Stock Market" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black opacity-70"></div>
            </div>
          </ParallaxSection>

          <div className="container mx-auto px-4 z-10 text-center relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Trade Smarter,
              <br />
              Invest Wiser
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto"
            >
              StockPro: Your all-in-one platform for intelligent stock trading. Analyze, invest, and grow your wealth
              with cutting-edge tools.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <a
                href="#features"
                className="bg-purple-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-600 transition duration-300 transform hover:scale-105"
              >
                Explore Features
              </a>
              <a
                href="#pricing"
                className="bg-transparent border-2 border-purple-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-400 hover:text-gray-900 transition duration-300 transform hover:scale-105"
              >
                View Pricing
              </a>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-12 h-12 text-purple-400" />
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center mb-16 text-purple-400"
            >
              Powerful Features for Smart Trading
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`bg-purple-800 p-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 ${
                      activeFeature === index ? "border-2 border-purple-400" : ""
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-700 p-3 rounded-full mr-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-purple-200">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
              <div className="relative h-[600px]">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={`/feature-${activeFeature + 1}.jpg`}
                    alt={features[activeFeature].title}
                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-purple-900">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:w-1/2 mb-12 md:mb-0"
              >
                <h2 className="text-4xl font-bold mb-6 text-purple-300">About StockPro</h2>
                <p className="text-xl text-purple-100 mb-8">
                  StockPro was born from a vision of democratizing stock trading. Our team of financial experts and tech
                  innovators came together to create a comprehensive platform that empowers both novice and experienced
                  traders.
                </p>
                <ul className="space-y-4">
                  {[
                    "Founded in 2021",
                    "Over 500,000 active traders",
                    "Partnered with 50+ global exchanges",
                    "AI-powered trading algorithms",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center text-purple-200"
                    >
                      <svg
                        className="w-6 h-6 text-purple-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:w-1/2 relative"
              >
                <img src="/about-stockpro.jpg" alt="About StockPro" className="rounded-lg shadow-2xl" />
                <div className="absolute -bottom-10 -left-10 bg-purple-600 text-white p-8 rounded-lg shadow-xl">
                  <p className="text-3xl font-bold">500K+</p>
                  <p className="text-xl">Active Traders</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="stats" className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16 text-purple-400">Our Impact in Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Active Traders", value: 500000, suffix: "+" },
                { label: "Daily Trades", value: 1000000, suffix: "+" },
                { label: "Assets Under Management", value: 5, suffix: "B+" },
                { label: "Global Exchanges", value: 50, suffix: "+" },
              ].map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} suffix={stat.suffix} />
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-purple-900">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center mb-16 text-purple-300"
            >
              Success Stories
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Day Trader",
                  quote:
                    "StockPro has revolutionized my trading strategy. The real-time analytics and intuitive interface have significantly improved my success rate.",
                  image: "/trader-1.jpg",
                  achievement: "250% portfolio growth in 6 months",
                },
                {
                  name: "Michael Chen",
                  role: "Long-term Investor",
                  quote:
                    "As a long-term investor, I appreciate StockPro's comprehensive research tools and portfolio management features. It's made diversification so much easier.",
                  image: "/trader-2.jpg",
                  achievement: "Managed a $2M portfolio with 15% YoY growth",
                },
                {
                  name: "Emily Rodriguez",
                  role: "Algo Trader",
                  quote:
                    "The API access and backtesting capabilities of StockPro are unparalleled. It's allowed me to develop and deploy trading algorithms with confidence.",
                  image: "/trader-3.jpg",
                  achievement: "Developed 5 profitable trading algorithms",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-purple-800 p-8 rounded-lg shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-purple-200">{testimonial.name}</h3>
                      <p className="text-purple-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-purple-100 italic mb-4">"{testimonial.quote}"</p>
                  <div className="bg-purple-700 text-purple-200 px-4 py-2 rounded-full inline-block">
                    {testimonial.achievement}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-center mb-16 text-purple-400"
            >
              Choose Your Perfect Plan
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-purple-800 p-8 rounded-lg shadow-md border-2 ${
                    index === activePlan ? "border-purple-400 transform scale-105" : "border-purple-700"
                  }`}
                  onMouseEnter={() => setActivePlan(index)}
                >
                  <h3 className="text-2xl font-bold mb-4 text-purple-300">{plan.name}</h3>
                  <p className="text-4xl font-bold mb-6 text-white">
                    {plan.price}
                    <span className="text-base font-normal text-purple-300">/month</span>
                  </p>
                  <ul className="mb-8 space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-purple-200">
                        <svg
                          className="w-5 h-5 text-purple-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-full font-semibold transition duration-300 ${
                      index === activePlan
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : "bg-purple-700 text-purple-200 hover:bg-purple-600"
                    }`}
                  >
                    Choose Plan
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="py-20 bg-purple-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-8 text-purple-300"
            >
              Ready to Start Your Trading Journey?
            </motion.h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto text-purple-100">
              Join StockPro today and take control of your financial future. Start your free trial now and experience
              the power of intelligent trading!
            </p>
            <motion.a
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block bg-purple-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-600 transition duration-300 transform hover:scale-105"
            >
              Start Your Free Trial
            </motion.a>
          </div>
        </section>
      </main>
    </div>
  )
}

