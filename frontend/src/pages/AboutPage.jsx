import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <div className="container mx-auto px-6 py-16">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-blue-600">
          About SPEAK
        </h1>

        <div className="max-w-4xl mx-auto space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is to break down communication barriers for the deaf and hard-of-hearing community.
              We believe in a world where everyone can communicate seamlessly, regardless of whether they use
              sign language or spoken language. SPEAK is our solution—a real-time bridge connecting these two worlds
              through the power of artificial intelligence.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              SPEAK combines several modern technologies into one smooth video call experience:
            </p>
            <ul className="list-disc list-inside space-y-4 text-lg">
              <li>
                <strong>Sign Language Recognition (SLR):</strong> Using a cutting-edge computer vision model,
                our app analyzes the user's video feed in real-time to detect and interpret sign language
                gestures, converting them instantly into text.
              </li>
              <li>
                <strong>Speech-to-Text (STT):</strong> For the hearing user, we use an advanced speech
                recognition API to transcribe their spoken words into accurate, real-time captions.
              </li>
              <li>
                <strong>Text-to-Speech (TTS):</strong> The translated sign language (now text) is
                simultaneously converted into clear, audible speech for the hearing user, enabling a
                natural, two-way conversation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">About the Project</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              SPEAK is a B.Tech final year project developed by a team of passionate engineering students.
              We are dedicated to applying our skills in full-stack development, machine learning, and
              real-time systems to create technology that has a tangible, positive social impact.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}