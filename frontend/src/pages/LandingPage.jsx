import React from 'react';
import { Link } from 'react-router-dom';
import heroIllustration from '../assets/hero-illustration.png';
import { MdOutlineMessage } from "react-icons/md";
import { MdVideoChat } from "react-icons/md";
import { TiMessages } from "react-icons/ti";
import { GoPerson } from "react-icons/go";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';


export default function LandingPage() {

    const { token } = useSelector((state) => state.auth);


    return (
        <div className="min-h-screen bg-white text-gray-800">
            <Navbar />

            <main className="container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between">
                <div className="lg:w-1/2 text-left mb-12 lg:mb-0">
                    <h2 className="text-6xl font-extrabold leading-tight mb-6">
                        Breaking Barriers <br /> Between Speech <br /> and Sign
                    </h2>
                    {token
                        ? <Link
                            to="/dashboard"
                            className="inline-block px-10 py-4 text-xl font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                        : <Link
                            to="/register"
                            className="inline-block px-10 py-4 text-xl font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                    }

                </div>

                <div className="lg:w-1/2 flex justify-center">
                    <img src={heroIllustration} alt="People communicating" className="max-w-full h-auto" />
                </div>
            </main>

            <section className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 shadow-blue-300">
                        <span className="text-5xl text-blue-500 mb-3"><MdVideoChat /></span>
                        <h3 className="text-xl font-semibold mb-2">Video Call</h3>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 shadow-blue-300">
                        <span className="text-5xl text-blue-500 mb-3"><TiMessages /></span>
                        <h3 className="text-xl font-semibold mb-2">Real-Time Translation</h3>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 shadow-blue-300">
                        <span className="text-5xl text-blue-500 mb-3"><MdOutlineMessage /></span>
                        <h3 className="text-xl font-semibold mb-2">Captions</h3>
                    </div>

                    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 shadow-blue-300">
                        <span className="text-5xl text-blue-500 mb-3"><GoPerson /></span>
                        <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}