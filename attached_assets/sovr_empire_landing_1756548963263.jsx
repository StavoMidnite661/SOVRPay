import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Crown, Cpu, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen font-serif">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            SOVR EMPIRE
          </h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto text-gray-300">
            Building the Future of Trust, Credit, and Empowerment
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button className="bg-yellow-500 text-black px-6 py-3 rounded-2xl shadow-lg hover:bg-yellow-400">
              Enter the Empire
            </Button>
            <Button variant="outline" className="border-yellow-500 text-yellow-500 px-6 py-3 rounded-2xl">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 text-center">
        <h2 className="text-4xl font-bold text-yellow-500 mb-6">About the Empire</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          SOVR EMPIRE is more than a company. We are the foundation of a new economic reality — one where trust-backed credit, decentralized value, and AI-driven execution empower people to live freely, securely, and abundantly.
        </p>
      </section>

      {/* Pillars */}
      <section className="py-20 px-6 bg-black">
        <h2 className="text-3xl font-bold text-center mb-12">Pillars of the Empire</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="bg-gray-900 border border-yellow-600 rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center">
              <Shield className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Trust & Law</h3>
              <p className="text-gray-400 text-center">Private Trust frameworks that protect and empower.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-yellow-600 rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center">
              <Crown className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Credit & Value</h3>
              <p className="text-gray-400 text-center">Transforming signatures into living assets.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-yellow-600 rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center">
              <Cpu className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">AI & Automation</h3>
              <p className="text-gray-400 text-center">Intelligent systems executing human intent.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-yellow-600 rounded-2xl shadow-lg">
            <CardContent className="p-6 flex flex-col items-center">
              <Users className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Community & Impact</h3>
              <p className="text-gray-400 text-center">Building tools that restore dignity and abundance.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-gray-950 text-gray-500 text-sm border-t border-gray-800">
        <p>© 2025 SOVR Development Holdings LLC dba SOVR EMPIRE. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
