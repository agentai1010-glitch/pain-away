import { useParams, Link } from "react-router-dom";
import { usePublicCatalogItem } from "@/services/catalog";

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: service, isLoading, isError } = usePublicCatalogItem(serviceId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-12 md:pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium text-lg">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Service Not Found</h1>
          <p className="text-slate-600 mb-8">The service you are looking for does not exist or is currently unavailable.</p>
          <Link to="/services" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors inline-block">
            Browse All Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-8">
      
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 mb-8 text-sm font-medium text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-blue-600 transition-colors">Services</Link>
        <span>/</span>
        <span className="text-slate-900">{service.name}</span>
      </div>

      {/* Hero Section */}
      <section className="px-6 max-w-5xl mx-auto mb-16">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-md mb-4">
              {service.item_type}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{service.name}</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">{service.description}</p>
            
            <div className="flex flex-wrap gap-6 items-center justify-center md:justify-start">
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Duration</p>
                <p className="text-xl font-bold text-slate-900">{service.duration_minutes || (service.session_count ? `${service.session_count} Sessions` : 'Variable')}</p>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Price</p>
                <p className="text-3xl font-extrabold text-blue-600">₹{service.price}</p>
              </div>
              
              <Link 
                to={`/book?service=${service.id}`} 
                className="mt-4 md:mt-0 md:ml-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Service Information */}
          <section className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              About the Treatment
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
              <p>
                Our {service.name} is designed to provide targeted relief and promote long-term recovery. 
                Using evidence-based practices, our expert physiotherapists will carefully assess your condition 
                before beginning the specialized protocol.
              </p>
              <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">Key Benefits</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Reduces pain and inflammation in targeted areas.</li>
                <li>Improves mobility and joint function.</li>
                <li>Prevents future injuries through strengthening.</li>
                <li>Customized specifically to your body's requirements.</li>
              </ul>
              
              <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">What to Expect</h3>
              <p>
                During your {service.duration_minutes ? `${service.duration_minutes}-minute` : ''} session, your physiotherapist will guide you through a series of exercises and treatments. Please wear comfortable, loose-fitting clothing to your appointment.
              </p>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Do I need a referral for this treatment?", a: "No, you do not need a referral to book an appointment with us. You can book directly." },
                { q: "Is this treatment painful?", a: "The treatment is designed to relieve pain, not cause it. You may experience some mild discomfort during certain stretching exercises, but we always work within your tolerance level." },
                { q: "How many sessions will I need?", a: "The number of sessions depends on your specific condition. Your physiotherapist will discuss a personalized treatment plan with you during your first visit." }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                  <p className="text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Clinic Info */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6">Clinic Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-blue-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <p className="font-semibold mb-1">Pain Away Headquarters</p>
                  <p className="text-slate-400 text-sm">123 Health Avenue, Medical District<br/>New Delhi, 110001</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-blue-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <div>
                  <p className="font-semibold mb-1">Clinic Timings</p>
                  <p className="text-slate-400 text-sm">Mon - Sat: 9:00 AM - 8:00 PM<br/>Sunday: Closed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-blue-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div>
                  <p className="font-semibold mb-1">Contact Us</p>
                  <p className="text-slate-400 text-sm">+91 98765 43210</p>
                </div>
              </div>
            </div>
            
            <a href="#" className="mt-8 block w-full py-3 text-center border border-slate-700 hover:bg-slate-800 rounded-xl font-bold transition-colors">
              View on Google Maps
            </a>
          </div>
          
          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Need Help?</h3>
            <p className="text-slate-600 text-sm mb-6">Not sure if this treatment is right for you? Call our desk for a free consultation.</p>
            <Link to={`/book?service=${service.id}`} className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}
