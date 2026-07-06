import { Link } from "react-router-dom";
import { usePublicCatalog } from "@/services/catalog";

export default function ServicesPage() {
  const { data: catalogItems, isLoading, isError } = usePublicCatalog();

  const services = catalogItems?.filter(item => item.item_type === "SERVICE") || [];
  const packages = catalogItems?.filter(item => item.item_type === "PACKAGE") || [];

  return (
    <div className="w-full min-h-screen font-sans pb-24 pt-28 md:pt-36 bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/images/products-bg.png')" }}>
      {/* Dark overlay to ensure readability while showing word cloud */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="text-center px-4 max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 font-bold text-sm mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Trusted Physiotherapy
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-sm">
            Expert Care for a <span className="text-blue-400">Pain-Free Life</span>
          </h1>
          <p className="text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto">
            Our clinic offers advanced, evidence-based physiotherapy services tailored to your unique needs. We help you recover faster, move better, and live fully.
          </p>
        </section>

        {/* Services Grid */}
        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-white mb-10 border-b border-white/20 pb-4 drop-shadow-md">Our Primary Services</h2>
          
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/15 min-h-[18rem] h-auto animate-pulse flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6"></div>
                    <div className="h-6 bg-white/20 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center p-12 bg-red-500/20 backdrop-blur-md rounded-3xl border border-red-400/30">
              <h3 className="text-xl font-bold text-red-300 mb-2">Unable to load services</h3>
              <p className="text-red-200">Please check your connection and try again.</p>
            </div>
          )}

          {!isLoading && !isError && services.length === 0 && (
            <div className="text-center p-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
              <p className="text-lg text-slate-300">No active services are currently available.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <Link 
                key={service.id} 
                to={`/services/${service.id}`}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl shadow-black/20 p-8 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group text-white cursor-pointer"
              >
                <div className="w-14 h-14 bg-blue-600/80 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-6 border border-blue-400/30 shadow-lg group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">{service.name}</h3>
                <p className="text-slate-200 mb-6 flex-grow line-clamp-3">{service.description || "Comprehensive assessment and personalized treatment plan."}</p>
                
                <div className="pt-6 border-t border-white/10 flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-sm text-slate-300 font-medium mb-1">Session Duration</p>
                    <p className="font-bold text-white">{service.duration_minutes || 60} mins</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm text-slate-300 font-medium mb-1">Session Price</p>
                    <p className="font-extrabold text-2xl text-white drop-shadow-sm">₹{service.price}</p>
                    <span className="text-xs font-semibold text-blue-300 group-hover:text-white transition-colors flex items-center gap-1 group-hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Packages Grid (if any) */}
        {!isLoading && !isError && packages.length > 0 && (
          <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-white mb-10 border-b border-white/20 pb-4 drop-shadow-md">Treatment Packages</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl hover:bg-white/15 hover:border-white/30 transition-all">
                  <div className="relative z-10">
                    <div className="inline-block px-3 py-1 bg-yellow-500/80 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider rounded-md mb-4 border border-yellow-400/30 shadow-md">
                      Recommended
                    </div>
                    <h3 className="text-3xl font-bold mb-3 drop-shadow-sm">{pkg.name}</h3>
                    <p className="text-slate-200 mb-8 max-w-md">{pkg.description || "A complete package designed for full recovery."}</p>
                    
                    <div className="flex items-end gap-6 mb-8">
                      <div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Total Sessions</p>
                        <p className="font-bold text-2xl text-white">{pkg.session_count || 5} Sessions</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Total Price</p>
                        <p className="font-extrabold text-4xl text-yellow-400 drop-shadow-sm">₹{pkg.price}</p>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/book?service=${pkg.id}`} 
                      className="inline-block px-8 py-4 bg-blue-600/90 backdrop-blur-md text-white rounded-xl font-bold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all border border-blue-400/30 shadow-xl"
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
        <section className="py-24 border-y border-white/15 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-16 drop-shadow-md">Why Choose Pain Away</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                <div className="w-20 h-20 mx-auto bg-blue-600/80 backdrop-blur-md text-white rounded-full flex items-center justify-center mb-6 border border-blue-400/30 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Certified Experts</h3>
                <p className="text-slate-200">Our team consists of highly trained and globally certified physiotherapy experts.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                <div className="w-20 h-20 mx-auto bg-blue-600/80 backdrop-blur-md text-white rounded-full flex items-center justify-center mb-6 border border-blue-400/30 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Modern Equipment</h3>
                <p className="text-slate-200">We use the latest medical technologies to ensure optimal recovery and diagnosis.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                <div className="w-20 h-20 mx-auto bg-blue-600/80 backdrop-blur-md text-white rounded-full flex items-center justify-center mb-6 border border-blue-400/30 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Personalized Care</h3>
                <p className="text-slate-200">Every treatment plan is specifically customized to your condition and lifestyle.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-12 lg:px-24 mt-24">
          <div className="bg-gradient-to-r from-blue-600/80 to-blue-800/80 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-black/30 max-w-5xl mx-auto">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-md">Ready to start your recovery?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Book your first consultation today and let our experts guide you to a pain-free life.</p>
              <Link 
                to="/book" 
                className="inline-block px-10 py-5 bg-white text-blue-900 rounded-2xl font-extrabold text-lg hover:bg-blue-50 hover:shadow-2xl transition-all hover:-translate-y-1 shadow-lg"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
