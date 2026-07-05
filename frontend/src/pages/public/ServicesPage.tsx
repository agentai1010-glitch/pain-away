import { Link } from "react-router-dom";
import { usePublicCatalog } from "@/services/catalog";

export default function ServicesPage() {
  const { data: catalogItems, isLoading, isError } = usePublicCatalog();

  const services = catalogItems?.filter(item => item.item_type === "SERVICE") || [];
  const packages = catalogItems?.filter(item => item.item_type === "PACKAGE") || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-12 md:pt-20">
      
      {/* Hero Section */}
      <section className="text-center px-4 max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Trusted Physiotherapy
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Expert Care for a <span className="text-blue-600">Pain-Free Life</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Our clinic offers advanced, evidence-based physiotherapy services tailored to your unique needs. We help you recover faster, move better, and live fully.
        </p>
      </section>

      {/* Services Grid */}
      <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-24">
        <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b border-slate-200 pb-4">Our Primary Services</h2>
        
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-3xl p-8 border border-slate-100 min-h-[18rem] h-auto animate-pulse flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center p-12 bg-red-50 rounded-3xl border border-red-100">
            <h3 className="text-xl font-bold text-red-700 mb-2">Unable to load services</h3>
            <p className="text-red-600">Please check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !isError && services.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-lg text-slate-500">No active services are currently available.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.name}</h3>
              <p className="text-slate-600 mb-6 flex-grow">{service.description || "Comprehensive assessment and personalized treatment plan."}</p>
              
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Session Duration</p>
                  <p className="font-bold text-slate-800">{service.duration_minutes || 60} mins</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium mb-1">Session Price</p>
                  <p className="font-extrabold text-2xl text-blue-600">₹ {service.price}</p>
                </div>
              </div>
              
              <Link to={`/services/${service.id}`} className="mt-8 block w-full py-4 text-center rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 transition-colors">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Packages Grid (if any) */}
      {!isLoading && !isError && packages.length > 0 && (
        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b border-slate-200 pb-4">Treatment Packages</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-950 text-xs font-black uppercase tracking-wider rounded-md mb-4">
                    Recommended
                  </div>
                  <h3 className="text-3xl font-bold mb-3">{pkg.name}</h3>
                  <p className="text-blue-200 mb-8 max-w-md">{pkg.description || "A complete package designed for full recovery."}</p>
                  
                  <div className="flex items-end gap-6 mb-8">
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Total Sessions</p>
                      <p className="font-bold text-2xl">{pkg.session_count || 5} Sessions</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Total Price</p>
                      <p className="font-extrabold text-4xl text-yellow-400">₹ {pkg.price}</p>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/book?service=${pkg.id}`} 
                    className="inline-block px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Select Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Pain Away */}
      <section className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-16">Why Choose Pain Away</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Certified Experts</h3>
              <p className="text-slate-600">Our team consists of highly trained and globally certified physiotherapy experts.</p>
            </div>
            <div>
              <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modern Equipment</h3>
              <p className="text-slate-600">We use the latest medical technologies to ensure optimal recovery and diagnosis.</p>
            </div>
            <div>
              <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Personalized Care</h3>
              <p className="text-slate-600">Every treatment plan is specifically customized to your condition and lifestyle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-24 mt-24">
        <div className="bg-blue-600 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to start your recovery?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Book your first consultation today and let our experts guide you to a pain-free life.</p>
            <Link 
              to="/book" 
              className="inline-block px-10 py-5 bg-white text-blue-700 rounded-2xl font-bold text-lg hover:bg-yellow-400 hover:text-yellow-950 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
