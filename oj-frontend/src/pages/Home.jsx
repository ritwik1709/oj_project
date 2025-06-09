import { Link } from 'react-router-dom';
import { FaCode, FaListAlt, FaChartLine, FaLaptopCode } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaCode className="w-8 h-8" />,
      title: "Online Compiler",
      description: "Write, compile, and run code in multiple languages including C++, Python, and Java.",
      link: "/compiler"
    },
    {
      icon: <FaListAlt className="w-8 h-8" />,
      title: "Problem Sets",
      description: "Access a wide range of coding problems with varying difficulty levels.",
      link: "/problems"
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor your submissions and track your improvement over time.",
      link: "/submissions"
    },
    {
      icon: <FaLaptopCode className="w-8 h-8" />,
      title: "Practice Anywhere",
      description: "Code on the go with our responsive design that works on all devices.",
      link: "/problems"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to JudgeX
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 dark:text-blue-200">
              Your ultimate platform for practicing coding problems and improving your programming skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/problems"
                className="bg-white text-blue-600 dark:bg-blue-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-800 transition duration-300 shadow-lg"
              >
                Start Coding
              </Link>
              <Link
                to="/compiler"
                className="bg-blue-500/20 text-white border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition duration-300"
              >
                Try Compiler
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Why Choose JudgeX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of developers who are already improving their skills with JudgeX
          </p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 transition duration-300 shadow-lg"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
