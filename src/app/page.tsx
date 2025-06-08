// app/page.tsx
import Header from "./components/Header";

export default function Page() {
  return (
    <div className='font-sans min-h-screen bg-gray-50'>
      <Header />
      <main className='p-6 max-w-4xl mx-auto'>
        {" "}
        {/* Added max-w and mx-auto for better content centering */}
        <h2 className='text-2xl font-semibold mb-4 text-gray-800'>
          Welcome to your Platter Order App!
        </h2>
        <p className='text-gray-700 leading-relaxed'>Some text</p>
        {/* Add more main content here */}
        <div className='mt-8 p-6 bg-white rounded-lg shadow-md'>
          <h3 className='text-xl font-semibold mb-3 text-gray-800'>
            Your Orders
          </h3>
          <p className='text-gray-600'>
            No recent orders found. Start by Browse our delicious platters!
          </p>
          <button className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'>
            Browse Platters
          </button>
        </div>
      </main>
    </div>
  );
}
